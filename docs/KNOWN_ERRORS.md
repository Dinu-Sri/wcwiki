# Known Errors & Workarounds — wcWIKI

> **Catalog of known issues, root causes, and fixes.**
> Add new entries when you encounter and resolve a problem.
> Canonical instructions: `AGENTS.md`

---

## 1. Tailwind CSS v4 → v3 Downgrade

**Status**: RESOLVED (workaround in place)

**Symptom**: Tailwind CSS v4 classes not generating styles in production build.

**Root Cause**: Node 18.20.5 incompatibility with Tailwind v4 PostCSS plugin. The v4 plugin
requires newer Node APIs not available in Node 18.

**Workaround**: Downgraded to Tailwind v3.4.17 with custom CSS variables for theming.

**Note**: `package.json` devDependencies still lists `"tailwindcss": "^4"` and
`"@tailwindcss/postcss": "^4"` — these are misleading. The actual Tailwind version
in use is v3.4.17 (config is at `postcss.config.mjs` with `tailwindcss` plugin).

**Future Fix**: When upgrading to Node 22+, re-evaluate Tailwind v4 migration.

---

## 2. PowerShell UTF-8 Encoding Bug

**Status**: RESOLVED (workaround documented)

**Symptom**: Content published via PowerShell `Invoke-RestMethod` shows garbled
special characters (em dashes become `â€"`, smart quotes become `â€œ`, etc.).

**Root Cause**: `Invoke-RestMethod` doesn't properly handle multi-byte UTF-8
characters when sending JSON bodies.

**Workaround** (for article body HTML):
- Use HTML entities: `&mdash;` for —, `&ndash;` for –, `&pound;` for £,
  `&ldquo;`/`&rdquo;` for smart quotes
- For excerpts: use ASCII only, no special characters

**Alternative**: Use `curl` or a Node.js script (`push-content.mjs`) instead of PowerShell.

---

## 3. Prisma Schema Changes Not Yet Migrated

**Status**: ONGOING

**Symptom**: Phase 2 schema changes exist in `prisma/schema.prisma` but have NOT been
pushed to the production database.

**Root Cause**: `prisma db push` was deferred during Phase 2 development.

**Impact**: New models/tables (SearchQuery, Translation, etc.) exist in the schema file
but not in the production PostgreSQL database.

**Required Action**: Run `prisma db push` on the production database. Test locally first.
Backup the production DB before pushing.

---

## 4. Docker Build Cache Issues

**Status**: INTERMITTENT

**Symptom**: Docker build succeeds but the running container uses stale code.

**Root Cause**: Docker layer caching. If `package.json` hasn't changed, Docker reuses
cached `node_modules` from a previous build.

**Fix**:
```bash
docker compose -f docker-compose.prod.yml build --no-cache app
docker compose -f docker-compose.prod.yml up -d app
```

Or in Portainer: enable "Always pull the image" and "Re-pull image and redeploy".

---

## 5. Meilisearch Index Out of Sync

**Status**: SELF-HEALING (on container restart)

**Symptom**: Search results missing newly added content.

**Root Cause**: Meilisearch is eventually consistent — `sync-meilisearch.js` runs on
container start but not continuously.

**Fix**: Either:
1. Restart the app container: `docker restart wcwiki-app`
2. Or manually run: `docker exec wcwiki-app node scripts/sync-meilisearch.js`

**Prevention**: Content published via the Content API (`/api/v1/*`) should trigger
incremental index updates (not yet implemented as of 2026-06-06).

---

## 6. Cloudflare Tunnel Disconnects

**Status**: SELF-HEALING (Docker restart policy)

**Symptom**: Site inaccessible via wcwiki.org but accessible via direct VPS IP.

**Root Cause**: Cloudflare Tunnel daemon lost connection to Cloudflare edge.

**Fix**: Usually self-healing (Docker `restart: unless-stopped`). If persistent:
```bash
docker restart wcwiki-tunnel
docker logs wcwiki-tunnel --tail 50
```

---

## 7. Nginx SSL Certificate Expiry

**Status**: PREVENTABLE

**Symptom**: SSL certificate error when accessing wcwiki.org.

**Root Cause**: Let's Encrypt certificate not renewed.

**Fix**:
```bash
certbot renew --nginx
nginx -s reload
```

**Prevention**: Certbot should auto-renew via systemd timer or cron. Verify:
```bash
systemctl status certbot.timer
```

---

## 8. `@tailwindcss/postcss` v4 Dependency Confusion

**Status**: COSMETIC (no functional impact)

**Symptom**: `package.json` devDependencies lists `"@tailwindcss/postcss": "^4"` but
the project actually uses Tailwind v3.4.17 with the `tailwindcss` PostCSS plugin.

**Impact**: None — `npm ci` installs the v4 package but it's not used at build time.
However, this could confuse developers.

**Recommended Fix**: Remove `@tailwindcss/postcss` from devDependencies and pin
`tailwindcss` to `^3.4.17` explicitly. Update `postcss.config.mjs` to confirm v3 config.

---

## 9. `CRON_SECRET` Not Set

**Status**: LIKELY (verify)

**Symptom**: Daily search analytics aggregation not running.

**Root Cause**: `daily-aggregate.js` checks for `CRON_SECRET` env var and skips
aggregation if not set.

**Fix**: Set `CRON_SECRET` in the Portainer stack environment variables and redeploy.

---

## Template for New Entries

```markdown
## N. Title

**Status**: [ONGOING | RESOLVED | INTERMITTENT | PREVENTABLE]

**Symptom**: What the user/developer sees.

**Root Cause**: Why it happens.

**Fix/Workaround**: How to resolve or work around it.

**Prevention**: How to avoid in the future.
```

---

## 10. `prisma db push --accept-data-loss` Replaced (2026-06-07)

**Status**: RESOLVED

**Symptom**: Previously, every container start ran `prisma db push --accept-data-loss`
which could silently drop columns that don't match the schema.

**Fix**: Replaced with `prisma migrate deploy` in `entrypoint.sh`. Generated initial
migration at `prisma/migrations/20260607000000_initial_schema/`. All future schema
changes should use `npx prisma migrate dev --name <name>` to create versioned migrations.

**Prevention**: Schema changes are now tracked in `prisma/migrations/`. Always test
on staging DB first (`npm run db:staging-migrate`).

---

## 11. Prisma P3005 on Existing Production Database

**Status**: MITIGATED (startup db push fallback added 2026-06-09)

**Symptom**: App container restart loops with `Error: P3005 The database schema is not empty`
when `prisma migrate deploy` runs.

**Root Cause**: The production database was created before Prisma migration history
existed, so tables are present but `_prisma_migrations` has no record of the initial
schema migration.

**Fix/Workaround**: `entrypoint.sh` first tries `prisma migrate deploy`. If that
fails because production is not baselined, it falls back to `prisma db push
--skip-generate` so the app can start. This command intentionally does not use
`--accept-data-loss`, so Prisma should refuse destructive changes instead of dropping
production data.

**Manual Baseline Fix** (preferred long-term resolution once the site is stable):
```bash
docker exec wcwiki-app npx prisma migrate resolve --applied 20260607000000_initial_schema
docker restart wcwiki-app
```

**Prevention**: Keep future schema changes as Prisma migrations and avoid returning
to untracked `db push` changes in production.

**Decision (2026-06-09)**: Keep the non-destructive startup fallback temporarily so
production stays online. Repair migration history later in a maintenance window, then
remove the fallback from `entrypoint.sh`.

---

*Last updated: 2026-06-07*
