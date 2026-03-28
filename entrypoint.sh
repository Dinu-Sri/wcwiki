#!/bin/sh
set -e

echo "Running database migrations..."

# Convert old ADMIN role to SUPER_ADMIN before schema push
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$executeRawUnsafe('UPDATE \"User\" SET role = \\'USER\\' WHERE role = \\'ADMIN\\'')
  .then(n => { if(n) console.log('Converted', n, 'ADMIN users to USER'); return p.\$disconnect(); })
  .catch(() => process.exit(0));
" 2>/dev/null || echo "Pre-migration user update skipped"

./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>/dev/null || \
  node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "Seeding initial data..."
node scripts/seed-data.js || echo "Seed skipped (will retry on next restart)"

echo "Syncing data to Meilisearch..."
node scripts/sync-meilisearch.js || echo "Meilisearch sync skipped (will retry on next restart)"

echo "Starting server..."
exec node server.js
