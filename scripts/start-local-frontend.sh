#!/usr/bin/env bash
# Usage: ./scripts/start-local-frontend.sh
set -euo pipefail
ENV_FILE="$(pwd)/artifacts/food-subscription/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "Missing $ENV_FILE — create it or set PORT and BASE_PATH environment variables"
  exit 1
fi
pnpm --filter @workspace/food-subscription run dev
