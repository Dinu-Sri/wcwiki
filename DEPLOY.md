# wcWIKI — Deployment & Version Update Guide

## Overview

Local development → GitHub → Portainer (VPS). All deployment is done via Docker Compose stacks managed through Portainer's web UI.

---

## Architecture

```
┌──────────────┐      git push       ┌──────────┐      pull & redeploy      ┌─────────────────┐
│  Local Dev   │  ──────────────►    │  GitHub   │  ◄────────────────────    │  VPS (Portainer) │
│  (VS Code)   │                     │   Repo    │                           │  Docker Stacks   │
└──────────────┘                     └──────────┘                           └─────────────────┘
```

---

## Workflow

### 1. Local Development

- Build and test features locally using `npm run dev`
- PostgreSQL + Meilisearch run locally via `docker-compose.yml` (dev config)
- Once a feature is stable and tested → commit and push to GitHub

### 2. Push to GitHub

```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

- The GitHub repo is already connected and accessible from the VPS
- **Do NOT push half-finished or broken code** — only push when locally verified

### 3. Deploy to VPS via Portainer

#### First-time setup:
1. Open Portainer web UI
2. Go to **Stacks** → **Add Stack**
3. Paste the production `docker-compose.prod.yml` content (provided below)
4. Set environment variables in Portainer's env var section
5. Click **Deploy the stack**

#### Updating to a new version:
1. SSH into VPS or use Portainer's console
2. Navigate to the project directory: `cd /opt/wcwiki`
3. Pull latest code: `git pull origin main`
4. Rebuild the app image: `docker compose -f docker-compose.prod.yml build app`
5. In Portainer: go to the stack → click **Update the stack** → **Pull and redeploy**
6. Alternatively from CLI: `docker compose -f docker-compose.prod.yml up -d --build app`

---

## Production Stack (for Portainer)

Paste this into Portainer's Stack editor on first deploy:

```yaml
services:
  app:
    build:
      context: /opt/wcwiki
      dockerfile: Dockerfile
    container_name: wcwiki-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://wcwiki:${DB_PASSWORD}@postgres:5432/wcwiki?schema=public
      - MEILISEARCH_HOST=http://meilisearch:7700
      - MEILISEARCH_API_KEY=${MEILI_MASTER_KEY}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - R2_PUBLIC_URL=${R2_PUBLIC_URL}
    depends_on:
      postgres:
        condition: service_healthy
      meilisearch:
        condition: service_started
    networks:
      - wcwiki-net

  postgres:
    image: postgres:16-alpine
    container_name: wcwiki-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: wcwiki
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: wcwiki
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wcwiki"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - wcwiki-net

  meilisearch:
    image: getmeili/meilisearch:v1.12
    container_name: wcwiki-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
      MEILI_DB_PATH: /meili_data
    volumes:
      - meilidata:/meili_data
    networks:
      - wcwiki-net

  nginx:
    image: nginx:alpine
    container_name: wcwiki-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    networks:
      - wcwiki-net

volumes:
  pgdata:
  meilidata:

networks:
  wcwiki-net:
    driver: bridge
```

---

## Environment Variables (set in Portainer)

| Variable | Example | Notes |
|----------|---------|-------|
| `DB_PASSWORD` | `strong-random-password` | PostgreSQL password |
| `MEILI_MASTER_KEY` | `strong-random-key` | Meilisearch API key |
| `NEXTAUTH_URL` | `https://wcwiki.org` | Public URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Auth encryption key |
| `GOOGLE_CLIENT_ID` | from Google Console | OAuth |
| `GOOGLE_CLIENT_SECRET` | from Google Console | OAuth |
| Google OAuth redirect URI | `https://wcwiki.org/api/auth/callback/google` | Add in Google Cloud Console |
| `NEXT_PUBLIC_BASE_URL` | `https://wcwiki.org` | Public URL for SEO |
| `R2_ACCOUNT_ID` | from Cloudflare | Image storage |
| `R2_ACCESS_KEY_ID` | from Cloudflare | Image storage |
| `R2_SECRET_ACCESS_KEY` | from Cloudflare | Image storage |
| `R2_BUCKET_NAME` | `wcwiki-images` | Image storage |
| `R2_PUBLIC_URL` | `https://images.wcwiki.org` | Public image CDN |

---

## VPS Directory Structure

```
/opt/wcwiki/
├── docker-compose.prod.yml
├── Dockerfile
├── nginx.conf
├── .env                      # NOT committed — set via Portainer env vars
└── (full repo clone)
```

---

## First-time Server Setup Commands

```bash
# 1. Clone repo on VPS
cd /opt
git clone https://github.com/YOUR_USERNAME/wcwiki.git
cd wcwiki

# 2. Deploy via Portainer (paste stack) or CLI:
docker compose -f docker-compose.prod.yml up -d

# 3. Run database migration
docker exec wcwiki-app npx prisma db push

# 4. Seed initial data
docker exec wcwiki-app npm run db:seed

# 5. Build search indexes
docker exec wcwiki-app node -e "require('./src/lib/search/sync').reindexAll()"
```

---

## Version Update Checklist

When pushing a new version:

1. **Local**: Test thoroughly — `npm run dev`, verify all features work
2. **Local**: Run `npm run build` to catch build errors
3. **Push**: `git add . && git commit -m "v0.x.x: description" && git push origin main`
4. **VPS**: `cd /opt/wcwiki && git pull origin main`
5. **Portainer**: Go to stack → **Update the stack** → enable **Re-pull image and redeploy**
6. **Verify**: Check the live site, test search, verify pages load
7. **If DB schema changed**: `docker exec wcwiki-app npx prisma db push`
8. **If search indexes changed**: Hit `/api/admin/reindex` or run reindex command

---

## Rollback

If a deploy breaks something:

```bash
# On VPS — revert to previous commit
cd /opt/wcwiki
git log --oneline -5          # Find the last good commit
git checkout <commit-hash>    # Revert to it
# Then redeploy in Portainer
```

---

## Cloudflare Tunnel Setup (wcwiki.org)

The app is served publicly through a Cloudflare Tunnel — no open inbound ports needed on the VPS. The tunnel container (`wcwiki-tunnel`) runs inside the stack and connects outbound to Cloudflare.

### Cloudflare Zero Trust — One-time configuration

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels**
2. Create a new tunnel (or open the existing one)
3. Copy the tunnel token
4. Go to the tunnel's **Public Hostnames** tab and add:
   - **Subdomain**: *(leave blank for root)*
   - **Domain**: `wcwiki.org`
   - **Type**: `HTTP`
   - **URL**: `app:3000`
5. Do not add `www.wcwiki.org` if you want the site to stay apex-only with no redirect hop
6. In Cloudflare **SSL/TLS** settings for `wcwiki.org`, set encryption mode to **Full**

### Portainer — Add environment variables

In the Portainer stack editor, add these two variables:

| Variable | Value |
|---|---|
| `CF_TUNNEL_TOKEN` | *(token from Cloudflare tunnel creation)* |
| `NEXTAUTH_URL` | `https://wcwiki.org` |

### Portainer — Deploy / Redeploy

1. Push latest code to GitHub (includes the tunnel service in `docker-compose.prod.yml`)
2. On VPS: `cd /opt/wcwiki && git pull origin main`
3. In Portainer: go to the **wcwiki** stack → **Update the stack**
4. Enable **Re-pull image and redeploy** → click **Update**
5. A new `wcwiki-tunnel` container will appear alongside `wcwiki-app`, `wcwiki-postgres`, `wcwiki-meilisearch`

### Validation

```bash
# Check tunnel connected successfully
docker logs wcwiki-tunnel

# Test domain resolves through tunnel
curl -I https://wcwiki.org
```

Expected tunnel log output: `Registered tunnel connection` or `Connection established`.

### Notes

- The `port 3001:3000` mapping on the app container is kept for direct VPS access during debugging
- With the tunnel active you can optionally firewall port 3001 from public access
- `app:3000` is the internal Docker network address — the tunnel reaches the app without going through the host

---

## Rules

- **Never push untested code to GitHub** — local dev first, always
- **Never edit code directly on the VPS** — all changes go through local → GitHub → VPS
- **Database migrations are manual** — run `prisma db push` after schema changes
- **Environment secrets live in Portainer** — never commit `.env` files with real credentials
- **.env.local is for local dev only** — safe to have dev-only values
