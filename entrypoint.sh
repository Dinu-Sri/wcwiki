#!/bin/sh
set -e

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration deploy failed. Attempting one-time baseline for existing production schema..."
  npx prisma migrate resolve --applied 20260607000000_initial_schema
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
