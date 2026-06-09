#!/bin/sh
set -e

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration deploy failed. Existing production DB may not be baselined."
  echo "Falling back to non-destructive prisma db push so the app can start."
  npx prisma db push --skip-generate
fi

echo "Syncing data to Meilisearch..."
node scripts/sync-meilisearch.js || echo "Meilisearch sync skipped (will retry on next restart)"

echo "Starting daily aggregation scheduler..."
node scripts/daily-aggregate.js &

echo "Starting backup scheduler (daily at 03:10 UTC)..."
node scripts/backup-scheduler.js &

echo "Starting server..."
exec node server.js
