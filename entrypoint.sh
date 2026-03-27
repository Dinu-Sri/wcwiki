#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma db push --skip-generate 2>/dev/null || \
  node node_modules/prisma/build/index.js db push --skip-generate

echo "Seeding initial data..."
node scripts/seed-data.js || echo "Seed skipped (will retry on next restart)"

echo "Syncing data to Meilisearch..."
node scripts/sync-meilisearch.js || echo "Meilisearch sync skipped (will retry on next restart)"

echo "Starting server..."
exec node server.js
