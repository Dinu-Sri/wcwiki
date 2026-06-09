# AGENTS.md — wcWIKI Production AI Agent Instructions

> **STATUS: PRODUCTION-LIVE** • Updated 2026-06-06
> This is the **single source of truth** for all AI agents working on this codebase.
> All derived files (`.github/copilot-instructions.md`, `ai/AI_CONTEXT.generated.md`)
> are synced from this file. When in doubt, this file wins.

---

## 1. Production-First Mandate

This is a **production SaaS project** — NOT a local-only prototype. Every change you make
must be designed for the live production environment at **wcwiki.org**.

### Hard Rules

| Rule | Detail |
|------|--------|
| **NO hardcoded localhost** | Never write `http://localhost:3000` in source code. Use `process.env.NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, or relative URLs. |
| **NO hardcoded file paths** | Never write `/Users/...`, `C:\...`, `/home/...`, or `/opt/wcwiki` in source. Use env vars or relative paths. |
| **NO secrets in code** | Never write passwords, API keys, tokens, or connection strings in source. Use env vars only. |
| **Environment variables only** | All configuration comes from environment variables. Reference `.env.example` for the full list. |
| **Preserve existing features** | Do not rewrite or remove working features unless explicitly asked. Improve incrementally. |
| **No unnecessary rewrites** | Refactor only when there is a clear bug, performance issue, or user-requested change. |
| **Document DB changes** | Any Prisma schema change must include migration steps in the commit message and `docs/TASK_LOG.md`. |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.3.4 |
| Language | TypeScript | 5 (strict) |
| Runtime | Node.js (Docker) | 20-alpine |
| Database | PostgreSQL | 16-alpine |
| ORM | Prisma | 5.22.0 |
| Search | Meilisearch | v1.12 |
| Auth | NextAuth.js v5 | 5.0.0-beta.30 |
| OAuth | Google OAuth + email/password (bcryptjs) | — |
| Styling | Tailwind CSS | 3.4.17 |
| i18n | next-intl | 4.8.3 |
| Rich Text | Tiptap | 3.21.0 |
| Image Storage | Cloudflare R2 (S3-compatible) | — |
| Image Processing | Sharp | 0.34.5 |
| Charts | Recharts | 3.8.1 |
| Reverse Proxy | Nginx | latest-alpine |
| Tunnel | Cloudflare Tunnel (cloudflared) | latest |
| Orchestration | Portainer (VPS) | latest |
| CI/CD | GitHub Actions + GHCR | — |

**10 Supported Locales**: en, zh, ja, ko, es, fr, ru, tr, ta, si

---

## 3. Architecture

```
┌──────────────┐     git push      ┌──────────┐     pull & redeploy      ┌────────────────────┐
│  Local Dev   │ ─────────────────►│  GitHub   │ ◄───────────────────────│  VPS (Portainer)   │
│  (VS Code)   │                   │  Repo     │                         │  Docker Stacks     │
└──────────────┘                   └──────────┘                         └────────────────────┘
```

### Production Services (docker-compose.prod.yml)

| Service | Container | Port | Notes |
|---------|----------|------|-------|
| `app` | `wcwiki-app` | 3000 (internal) / 3001 (host) | Next.js standalone server |
| `postgres` | `wcwiki-postgres` | 5432 | PostgreSQL 16 with health check |
| `meilisearch` | `wcwiki-meilisearch` | 7700 | Meilisearch v1.12 |
| `tunnel` | `wcwiki-tunnel` | — | Cloudflare Tunnel daemon |
| `nginx` | (external) | 443/80 | SSL termination + reverse proxy |

### Docker Image
- **Registry**: `ghcr.io/dinu-sri/wcwiki:latest`
- **Build**: Multi-stage (deps → builder → runner)
- **Entrypoint**: `entrypoint.sh` → `prisma migrate deploy` → fallback `prisma db push --skip-generate` if production is not baselined → Meilisearch sync → daily cron → `node server.js`
- **User**: `nextjs:nodejs` (1001:1001, non-root)

---

## 4. Environment Variables

All of these must be set in production (Portainer stack env vars) and defined in `.env.example`.
**Never commit real values.**

### Database
| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://wcwiki:PASSWORD@postgres:5432/wcwiki?schema=public` | Prisma DB connection |

### Meilisearch
| Variable | Example | Purpose |
|----------|---------|---------|
| `MEILISEARCH_HOST` | `http://meilisearch:7700` | Meilisearch URL |
| `MEILISEARCH_API_KEY` | (master key) | Meilisearch master key |

### NextAuth
| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXTAUTH_URL` | `https://wcwiki.org` | Canonical base URL |
| `NEXTAUTH_SECRET` | (random string) | Session encryption secret |
| `GOOGLE_CLIENT_ID` | (OAuth ID) | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | (OAuth secret) | Google OAuth secret |

### Public
| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_BASE_URL` | `https://wcwiki.org` | Public-facing base URL |

### Cloudflare R2 (Image Storage)
| Variable | Example | Purpose |
|----------|---------|---------|
| `R2_ACCOUNT_ID` | (account ID) | Cloudflare account |
| `R2_ACCESS_KEY_ID` | (access key) | R2 access key |
| `R2_SECRET_ACCESS_KEY` | (secret key) | R2 secret key |
| `R2_BUCKET_NAME` | `wcwiki-images` | R2 bucket name |
| `R2_PUBLIC_URL` | `https://images.wcwiki.org` | Public image base URL |

### Production-Only
| Variable | Example | Purpose |
|----------|---------|---------|
| `POSTGRES_PASSWORD` | (secure password) | PostgreSQL password (docker-compose.prod.yml) |
| `MEILI_MASTER_KEY` | (master key) | Meilisearch master key (prod compose) |
| `CF_TUNNEL_TOKEN` | (tunnel token) | Cloudflare Tunnel authentication |
| `CRON_SECRET` | (random string) | Enables daily aggregation cron job |

---

## 5. Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL + Meilisearch)
- Git

### Quick Start
```bash
cd wcwiki
cp .env.example .env.local      # Edit .env.local with your values
docker compose up -d             # Start PostgreSQL + Meilisearch
npm ci                           # Install dependencies
npx prisma db push               # Push schema to local DB
npm run dev                      # Start dev server at http://localhost:3000
```

### Useful Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build check |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to DB (no migration file) |
| `npm run db:migrate` | Interactive Prisma migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run search:reindex` | Reindex all data to Meilisearch |
| `docker compose up -d` | Start dev DB + Meilisearch |
| `docker compose down` | Stop dev services |

---

## 6. Change Impact Checklist

For EVERY code change you propose, answer these questions explicitly:

### Must-Answer Questions
- [ ] **Environment Variables**: Does this need new or changed env vars?
- [ ] **Dependencies**: Does `package.json` change? Run `npm ci` on deploy?
- [ ] **Database Migration**: Does `schema.prisma` change? Run `prisma migrate dev --name <name>` and review the generated SQL. Use local `db push` only for throwaway development databases.
- [ ] **Container Rebuild**: Does the Docker image need rebuilding? (`docker compose build app`)
- [ ] **Portainer Redeploy**: Does the Portainer stack need updating? ("Update the stack" → "Re-pull and redeploy")
- [ ] **Cache Clear**: Does Next.js build cache, Meilisearch index, or browser cache need clearing?
- [ ] **Worker/Queue Restart**: Does the daily aggregation cron need restarting?
- [ ] **Cron Update**: Does `daily-aggregate.js` or its schedule change?
- [ ] **Meilisearch Reindex**: Do search indexes need rebuilding? (`npm run search:reindex`)
- [ ] **Nginx Reload**: Does `nginx.conf` change? (`nginx -s reload`)

### Required Commit Message Format
```
<type>: <description>

ENV: <new or changed env vars, or "none">
DB: <migration steps, or "none">
REDEPLOY: <yes/no - does Portainer need redeploy?>
ROLLBACK: <how to undo this change>
```

---

## 7. Deployment Steps (Standard)

### Local → GitHub
```bash
npm run lint                 # Must pass
npm run build                # Must succeed
git add .
git commit -m "feat: ..."   # Follow format above
git push origin master
```

### GitHub → VPS (Portainer)
1. GitHub Actions builds & pushes `ghcr.io/dinu-sri/wcwiki:latest` on master push
2. SSH to VPS: `ssh user@vps`
3. `cd /opt/wcwiki && git pull origin master`
4. If auto-rebuild hook is installed, Docker rebuilds automatically
5. Otherwise: in Portainer UI → Stacks → wcwiki → "Update the stack" → "Re-pull image and redeploy"
6. Or CLI: `docker compose -f docker-compose.prod.yml up -d --build app`
7. Verify: `docker logs wcwiki-app --tail 20`

### Rollback
```bash
git revert <commit-hash>
git push origin master
# Then redeploy via Portainer as above
```

---

## 8. Supporting Documentation

| File | Purpose |
|------|---------|
| `docs/DEPLOYMENT_WORKFLOW.md` | Step-by-step deploy/rollback checklist |
| `docs/PRODUCTION_RULES.md` | Hard rules for production code |
| `docs/KNOWN_ERRORS.md` | Catalog of known issues & workarounds |
| `docs/TASK_LOG.md` | Running log of all changes with rollback notes |
| `docs/SYSTEM_OVERVIEW.md` | Complete system overview for research/planning AI agents |
| `docs/API.md` | Content API v1 reference |
| `docs/SEARCH-RULES.md` | Search engine architecture & auto-suggest rules |
| `ai/start-session.prompt.md` | Reusable session starter for any AI assistant |
| `ai/AI_CONTEXT.generated.md` | Auto-generated context summary (from this file) |
| `.github/copilot-instructions.md` | GitHub Copilot-specific rules (synced from this file) |

---

## 9. Update Process

When stack, deployment, environment variables, known errors, or architecture changes:

1. Update `AGENTS.md` (this file) first
2. Sync changes to `.github/copilot-instructions.md`
3. Update affected docs in `docs/`
4. Log the change in `docs/TASK_LOG.md`
5. Commit all doc changes in the same commit as the code change

---

## 10. Key Production Facts

- **Domain**: wcwiki.org (Cloudflare Tunnel → Nginx → Next.js:3000)
- **VPS path**: `/opt/wcwiki`
- **Git branch**: `master` (not `main`)
- **Image registry**: `ghcr.io/dinu-sri/wcwiki:latest`
- **DB migrations**: `entrypoint.sh` runs `prisma migrate deploy` on every container start. Because the live DB predates migration history, startup currently falls back to `prisma db push --skip-generate` if deploy fails. This fallback is non-destructive (no `--accept-data-loss`) and should remain documented until production migration history is repaired in a maintenance window.
- **First migration**: `prisma/migrations/20260607000000_initial_schema/` — full DDL snapshot of all 19 models
- **Schema changes**: Run `npx prisma migrate dev --name <name>` to generate a new migration; review the generated SQL; test on staging DB (`docker compose up postgres-staging` + `npm run db:staging-migrate`); then commit and deploy
- **Search sync**: Auto-runs on container start via `sync-meilisearch.js`
- **Daily cron**: `daily-aggregate.js` runs in background; requires `CRON_SECRET` to function
- **Content API auth**: `Authorization: Bearer wk_<api_key>` header
- **Content encoding**: Use HTML entities in article body, ASCII-only in excerpts (PowerShell Unicode bug)
- **Image uploads**: Max 10MB, auto-convert to WebP, stored in Cloudflare R2
- **Search indexes**: `artists`, `paintings`, `articles`, `suggestions`
- **Auto-suggest**: Uses past DB queries only (not content titles), 3-char min, 2-occurrence min, 90-day window

---

*This file is the canonical source of truth. When any of the above changes, update this file and sync derived files in the same commit.*
