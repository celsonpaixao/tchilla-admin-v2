#!/bin/bash
# Commita (opcional) e sobe a branch atual para todos os remotes.
# Uso:
#   ./scripts/push-all.sh                  → só push
#   ./scripts/push-all.sh "minha mensagem" → commit + push

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTES=(origin personal)

# Se passou mensagem, commita antes
if [ -n "$1" ]; then
  git add -A
  git commit -m "$1"
fi

echo "→ Subindo branch '$BRANCH' para: ${REMOTES[*]}"

for remote in "${REMOTES[@]}"; do
  echo ""
  echo "  ↑ $remote"
  git push "$remote" "$BRANCH"
done

echo ""
echo "✓ Push concluído em todos os remotes."
