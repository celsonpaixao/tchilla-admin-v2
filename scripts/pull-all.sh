#!/bin/bash
# Busca todos os remotes e atualiza o local com a versão mais avançada,
# sem enviar nada. Para também igualar os remotes entre si, use sync-all.sh.
# Uso:
#   ./scripts/pull-all.sh                → atualiza a branch atual
#   ./scripts/pull-all.sh main develop   → atualiza as branches indicadas
#   ./scripts/pull-all.sh --all          → atualiza todas as branches locais

exec "$(dirname "$0")/sync-all.sh" --no-push "$@"
