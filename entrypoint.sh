#!/bin/sh
set -e

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration deploy failed. Attempting one-time baseline for existing production schema..."
  echo "Available migrations:"
  ls -la prisma/migrations
  INITIAL_MIGRATION="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | head -n 1)"
  INITIAL_MIGRATION="$(basename "$INITIAL_MIGRATION")"
  if [ -z "$INITIAL_MIGRATION" ]; then
    echo "No migration directory found in prisma/migrations. Cannot baseline."
    exit 1
  fi
  echo "Marking migration as applied: $INITIAL_MIGRATION"
  npx prisma migrate resolve --applied "$INITIAL_MIGRATION"
  npx prisma migrate deploy
fi

echo "Syncing data to Meilisearch..."
node scripts/sync-meilisearch.js || echo "Meilisearch sync skipped (will retry on next restart)"

echo "Starting daily aggregation scheduler..."
node scripts/daily-aggregate.js &

echo "Starting backup scheduler (daily at 03:10 UTC)..."
node scripts/backup-scheduler.js &

echo "Starting server..."
exec node server.js
