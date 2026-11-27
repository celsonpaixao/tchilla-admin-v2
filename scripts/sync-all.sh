#!/bin/bash
# Sincroniza branches entre o local e todos os remotes.
# Descobre qual cópia está mais à frente (local, origin ou personal), atualiza
# o local e envia para os remotes que ficaram para trás. Nunca usa force push.
#
# Uso:
#   ./scripts/sync-all.sh                → sincroniza a branch atual
#   ./scripts/sync-all.sh main develop   → sincroniza as branches indicadas
#   ./scripts/sync-all.sh --all          → sincroniza todas as branches locais
#   ./scripts/sync-all.sh --no-push ...  → só atualiza o local (usado pelo pull-all.sh)
#
# Casos tratados:
#   - um remote à frente do outro      → fast-forward do local e push para o atrasado
#   - local à frente dos remotes       → push para os remotes
#   - branch inexistente num remote    → é criada nesse remote
#   - alterações locais por commitar   → guardadas em stash e restauradas no fim
#   - históricos divergentes           → merge na branch atual; se houver conflito,
#                                        o merge é abortado e nada é enviado

set -eo pipefail

REMOTES=(origin personal)

PUSH=1
BRANCHES=()
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    --all)     while read -r b; do BRANCHES+=("$b"); done < <(git for-each-ref --format='%(refname:short)' refs/heads) ;;
    -*)        echo "Opção desconhecida: $arg" >&2; exit 2 ;;
    *)         BRANCHES+=("$arg") ;;
  esac
done

CURRENT=$(git symbolic-ref --short -q HEAD || true)

if [ ${#BRANCHES[@]} -eq 0 ]; then
  if [ -z "$CURRENT" ]; then
    echo "✗ HEAD destacado (detached). Indique a branch: ./scripts/sync-all.sh <branch>" >&2
    exit 1
  fi
  BRANCHES=("$CURRENT")
fi

for state in MERGE_HEAD rebase-merge rebase-apply CHERRY_PICK_HEAD REVERT_HEAD; do
  if [ -e "$(git rev-parse --git-path "$state")" ]; then
    echo "✗ Há uma operação git em curso ($state). Termine-a ou aborte-a antes de sincronizar." >&2
    exit 1
  fi
done

# ── Stash automático ────────────────────────────────────────────────────────
STASHED=0

stash_if_dirty() {
  if [ "$STASHED" = 0 ] && [ -n "$(git status --porcelain)" ]; then
    echo "  → Guardando alterações locais em stash"
    git stash push --include-untracked --quiet -m "sync-all: autostash" || return 1
    STASHED=1
  fi
}

restore_stash() {
  if [ "$STASHED" = 1 ]; then
    echo ""
    echo "→ Restaurando alterações locais do stash"
    if ! git stash pop --quiet >/dev/null; then
      echo "⚠ Conflito ao restaurar o stash. Resolva os conflitos; as alterações continuam em 'git stash list'." >&2
    fi
    STASHED=0
  fi
}
trap restore_stash EXIT

# ── Utilitários ─────────────────────────────────────────────────────────────
ref_exists()  { git rev-parse -q --verify "$1^{commit}" >/dev/null; }
is_ancestor() { git merge-base --is-ancestor "$1" "$2"; }
sha()         { git rev-parse "$1"; }
short()       { git rev-parse --short "$1"; }

FAILED=()

# ── Fetch de todos os remotes ───────────────────────────────────────────────
echo "→ Buscando atualizações de: ${REMOTES[*]}"
for remote in "${REMOTES[@]}"; do
  if ! git fetch --prune --quiet "$remote"; then
    echo "✗ Falha ao buscar '$remote'. Verifique a ligação/credenciais e tente de novo." >&2
    exit 1
  fi
done

# ── Sincronização de uma branch ─────────────────────────────────────────────
sync_branch() {
  local branch=$1
  local local_ref="refs/heads/$branch"
  local candidates=()

  echo ""
  echo "■ $branch"

  ref_exists "$local_ref" && candidates+=("$local_ref")
  for remote in "${REMOTES[@]}"; do
    ref_exists "refs/remotes/$remote/$branch" && candidates+=("refs/remotes/$remote/$branch")
  done

  if [ ${#candidates[@]} -eq 0 ]; then
    echo "  ✗ Branch não existe no local nem em nenhum remote"
    return 1
  fi

  # Procura a ponta mais avançada; se duas cópias não forem ancestrais uma da
  # outra, o histórico divergiu.
  local target="" diverged=0 c
  for c in "${candidates[@]}"; do
    if [ -z "$target" ]; then
      target=$c
    elif is_ancestor "$c" "$target"; then
      :
    elif is_ancestor "$target" "$c"; then
      target=$c
    else
      diverged=1
    fi
  done

  if [ "$diverged" = 1 ]; then
    if [ "$branch" != "$CURRENT" ]; then
      echo "  ✗ Históricos divergentes. Faça checkout de '$branch' e rode o script de novo para fazer merge."
      return 1
    fi
    echo "  ⚠ Históricos divergentes — fazendo merge na branch atual"
    stash_if_dirty || return 1
    for c in "${candidates[@]}"; do
      [ "$c" = "$local_ref" ] && continue
      is_ancestor "$c" HEAD && continue
      echo "  ⇄ merge ${c#refs/remotes/}"
      if ! git merge --no-edit --quiet "${c#refs/remotes/}"; then
        git merge --abort || true
        echo "  ✗ Conflito ao fazer merge de ${c#refs/remotes/}. Merge abortado, nada foi alterado."
        echo "    Resolva manualmente: git merge ${c#refs/remotes/}"
        return 1
      fi
    done
    target=$local_ref
  fi

  # Atualiza o local para a ponta mais avançada
  if ! ref_exists "$local_ref"; then
    git branch --quiet "$branch" "$target" || return 1
    echo "  + local criada em $(short "$target") (${target#refs/remotes/})"
  elif [ "$(sha "$local_ref")" != "$(sha "$target")" ]; then
    local before
    before=$(short "$local_ref")
    if [ "$branch" = "$CURRENT" ]; then
      stash_if_dirty || return 1
      git merge --ff-only --quiet "$target" || { echo "  ✗ Não foi possível atualizar o local"; return 1; }
    else
      git fetch --quiet . "$target:$local_ref" || { echo "  ✗ Não foi possível atualizar o local (branch aberta noutro worktree?)"; return 1; }
    fi
    echo "  ↓ local  $before → $(short "$local_ref") (${target#refs/remotes/})"
  else
    echo "  ✓ local  em dia ($(short "$local_ref"))"
  fi

  [ "$PUSH" = 0 ] && return 0

  # Envia para os remotes que estão atrás (ou onde a branch não existe)
  local tip status=0
  tip=$(sha "$local_ref")
  for remote in "${REMOTES[@]}"; do
    local rref="refs/remotes/$remote/$branch"
    if ref_exists "$rref" && [ "$(sha "$rref")" = "$tip" ]; then
      echo "  ✓ $remote em dia"
      continue
    fi
    local label="atualizado"
    ref_exists "$rref" || label="branch criada"
    if git push --quiet "$remote" "$local_ref:refs/heads/$branch"; then
      echo "  ↑ $remote $label ($(short "$tip"))"
    else
      echo "  ✗ $remote recusou o push (alguém enviou entretanto ou a branch é protegida)"
      status=1
    fi
  done
  return $status
}

for branch in "${BRANCHES[@]}"; do
  sync_branch "$branch" || FAILED+=("$branch")
done

restore_stash

echo ""
if [ ${#FAILED[@]} -eq 0 ]; then
  if [ "$PUSH" = 1 ]; then
    echo "✓ Sincronização concluída: local e ${REMOTES[*]} estão iguais."
  else
    echo "✓ Pull concluído: local atualizado com ${REMOTES[*]}."
  fi
else
  echo "✗ Terminado com problemas em: ${FAILED[*]}" >&2
  exit 1
fi
