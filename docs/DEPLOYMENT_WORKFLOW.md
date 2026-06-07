# Deployment Workflow — wcWIKI

> **Part of the wcWIKI production documentation suite.**
> Canonical instructions: `AGENTS.md`

---

## Architecture

```
Local VS Code → git push → GitHub (master) → GHCR image build → VPS git pull → Portainer redeploy
```

---

## Pre-Deployment Checklist (Local)

Run these before every push to master:

- [ ] `npm run lint` — passes with zero errors
- [ ] `npm run build` — succeeds without warnings
- [ ] `docker compose -f docker-compose.yml config` — validates
- [ ] Manually test the changed feature in dev (`npm run dev`)
- [ ] No `.env*` files staged for commit (check with `git status`)
- [ ] Commit message follows format (ENV, DB, REDEPLOY, ROLLBACK)

---

## Step 1: Push to GitHub

```bash
git add <changed-files>
git commit -m "feat: description

ENV: none
DB: none
REDEPLOY: yes
ROLLBACK: git revert <hash>"
git push origin master
```

Wait for GitHub Actions to build & push the Docker image:
- Workflow: `.github/workflows/docker-image.yml`
- Image: `ghcr.io/dinu-sri/wcwiki:latest`
- Monitor: GitHub → Actions tab

---

## Step 2: Deploy to VPS via Portainer

### Option A: Auto-Rebuild Hook (if installed)

```bash
ssh user@vps
cd /opt/wcwiki
git pull origin master
# Auto-rebuild hook triggers Docker rebuild automatically
```

Skip rebuild: `WCWIKI_SKIP_AUTO_REBUILD=1 git pull origin master`

### Option B: Manual Portainer Redeploy

1. Open Portainer web UI
2. Navigate to **Stacks** → **wcwiki** (or your stack name)
3. Click **Update the stack**
4. Select **Re-pull image and redeploy**
5. Click **Update**
6. Wait for all services to show "Running"

### Option C: CLI Redeploy

```bash
ssh user@vps
cd /opt/wcwiki
git pull origin master
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d --build app
```

---

## Step 3: Verify Deployment

```bash
# Check container status
docker ps --filter "name=wcwiki"

# Check app logs
docker logs wcwiki-app --tail 30

# Check database connectivity
docker logs wcwiki-app --tail 50 | grep -i "migration\|prisma\|database"

# Check Meilisearch sync
docker logs wcwiki-app --tail 50 | grep -i "meilisearch\|syncing"

# Test the site
curl -I https://wcwiki.org
```

### Health Check Endpoints
- `https://wcwiki.org` — Should return 200
- `https://wcwiki.org/api/search?q=test` — Search API
- `https://wcwiki.org/en/artists/jmw-turner` — Known content page

---

## Rollback Procedure

### If deployment fails:

```bash
ssh user@vps
cd /opt/wcwiki

# Option 1: Revert and redeploy
git revert <bad-commit-hash>
git push origin master
# Wait for new GHCR image, then redeploy

# Option 2: Roll back to previous image
docker compose -f docker-compose.prod.yml pull app  # pulls latest (good if fixed)
# Or specify a previous image tag
docker tag ghcr.io/dinu-sri/wcwiki:previous ghcr.io/dinu-sri/wcwiki:latest
docker compose -f docker-compose.prod.yml up -d app
```

### Database Rollback
- Prisma does not support automatic down migrations
- If `prisma db push` changed the schema and something broke:
  1. Revert the `schema.prisma` change
  2. Push the reverted schema: `prisma db push`
  3. Note: `--accept-data-loss` may drop columns — always backup first

---

## Database Backups (Before Risky Changes)

### Automated (VPS cron — recommended)

Install the cron job once on the VPS:

```bash
# Add to crontab: daily backup at 3 AM UTC
crontab -e
# Add this line:
0 3 * * * /opt/wcwiki/scripts/backup-db.sh >> /var/log/wcwiki-backup.log 2>&1
```

The script (`scripts/backup-db.sh`):
- Creates compressed dumps at `/opt/backups/wcwiki/`
- Keeps 14 days of daily backups by default
- Configurable via `BACKUP_DIR`, `RETENTION_DAYS`, `DB_CONTAINER` env vars

### Manual (on-demand)

```bash
# On VPS
docker exec wcwiki-postgres pg_dump -U wcwiki wcwiki > /opt/backups/wcwiki-$(date +%Y%m%d-%H%M%S).sql
```

### Restore from Backup

```bash
# 1. Stop the app to prevent writes during restore
docker stop wcwiki-app

# 2. Restore from compressed backup
gunzip -c /opt/backups/wcwiki/wcwiki-20260607-030000.sql.gz | docker exec -i wcwiki-postgres psql -U wcwiki wcwiki

# 3. Start the app
docker start wcwiki-app
```

---

## Common Scenarios

### Schema Change (Prisma)
1. Edit `prisma/schema.prisma`
2. Test locally: `npx prisma db push`
3. Commit with `DB: prisma db push --accept-data-loss` in message
4. Deploy — entrypoint.sh runs `prisma db push` automatically

### New Environment Variable
1. Add to `.env.example` with placeholder
2. Add to Portainer stack env vars
3. Commit with `ENV: NEW_VAR=<description>` in message
4. Redeploy stack for env var to take effect

### New Dependency
1. `npm install <package>`
2. Commit `package.json` + `package-lock.json`
3. Docker rebuild will run `npm ci` automatically
4. Commit with `ENV: none` + `REDEPLOY: yes`

### Content Update (No Code Change)
1. Use the Content API (see `docs/API.md`)
2. No redeploy needed — content is stored in DB

---

*Last updated: 2026-06-06*
