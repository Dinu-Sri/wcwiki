#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma db push --skip-generate 2>/dev/null || \
  node node_modules/prisma/build/index.js db push --skip-generate

echo "Starting server..."
exec node server.js
