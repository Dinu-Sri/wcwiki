#!/usr/bin/env sh
set -eu

REPO_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$REPO_DIR"

COMPOSE_FILE="docker-compose.prod.yml"

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "Docker Compose is not installed or not available in PATH." >&2
    exit 1
  fi
}

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Missing $COMPOSE_FILE in $REPO_DIR" >&2
  exit 1
fi

echo "Rebuilding wcwiki app from latest pulled code..."
compose -f "$COMPOSE_FILE" up -d --build app

echo "Ensuring Cloudflare tunnel is running..."
compose -f "$COMPOSE_FILE" up -d tunnel

echo "Auto rebuild complete."