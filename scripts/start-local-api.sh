#!/usr/bin/env bash
# Usage: ./scripts/start-local-api.sh
# Loads env from artifacts/api-server/.env and starts the backend in dev mode
set -euo pipefail
ENV_FILE="$(pwd)/artifacts/api-server/.env"
if [ -f "$ENV_FILE" ]; then
  # export variables defined in the .env
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "Missing $ENV_FILE — create it or export DATABASE_URL and SESSION_SECRET"
  exit 1
fi
# Ensure dependencies installed
pnpm install --silent
# Start the backend
pnpm --filter @workspace/api-server run dev
