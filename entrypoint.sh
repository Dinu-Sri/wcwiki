#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>/dev/null || \
  node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "Syncing data to Meilisearch..."
node scripts/sync-meilisearch.js || echo "Meilisearch sync skipped (will retry on next restart)"

echo "Starting daily aggregation scheduler..."
node scripts/daily-aggregate.js &

echo "Starting server..."
exec node server.js
