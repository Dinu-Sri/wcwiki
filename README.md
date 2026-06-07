# wcWIKI — Watercolor Art Search Engine

A mobile-first, minimalistic watercolor art search engine with artist profiles,
painting galleries, community articles, and 10-language support.

**Production URL**: [wcwiki.org](https://wcwiki.org)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma 5.22 |
| Search | Meilisearch v1.12 |
| Auth | NextAuth v5 (Google OAuth + email/password) |
| Styling | Tailwind CSS 3.4 |
| i18n | next-intl 4.8 (10 locales) |
| Rich Text | Tiptap 3.21 |
| Images | Cloudflare R2 + Sharp (AVIF/WebP) |
| Deployment | Docker + Portainer + Cloudflare Tunnel |

**10 Locales**: English, 中文, 日本語, 한국어, Español, Français, Русский, Türkçe, தமிழ், සිංහල

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm ci

# 2. Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Start development services (PostgreSQL + Meilisearch)
docker compose up -d

# 4. Push database schema
npx prisma db push

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Interactive Prisma migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run search:reindex` | Reindex all data to Meilisearch |

---

## Deployment

This project is deployed on a VPS using **Docker + Portainer + Cloudflare Tunnel**.

```
Local VS Code → git push origin master → GitHub Actions builds GHCR image
→ VPS git pull → Portainer redeploys stack → wcwiki.org
```

### Full Deployment Guide

See **[docs/DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md)** for step-by-step
deploy, verify, and rollback instructions.

### Quick Deploy (after push to master)

```bash
# On VPS
cd /opt/wcwiki
git pull origin master
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d --build app
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development.
All variables must be set in Portainer for production.

See **[.env.example](.env.example)** for the complete list with descriptions.

---

## Documentation

| File | Purpose |
|------|---------|
| [AGENTS.md](AGENTS.md) | AI agent instructions (single source of truth) |
| [docs/DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md) | Deployment checklist & rollback |
| [docs/PRODUCTION_RULES.md](docs/PRODUCTION_RULES.md) | 10 hard rules for production code |
| [docs/KNOWN_ERRORS.md](docs/KNOWN_ERRORS.md) | Catalog of known issues |
| [docs/TASK_LOG.md](docs/TASK_LOG.md) | Running change log |
| [docs/API.md](docs/API.md) | Content API v1 reference |
| [docs/SEARCH-RULES.md](docs/SEARCH-RULES.md) | Search architecture & auto-suggest |
| [DEPLOY.md](DEPLOY.md) | Original deployment guide |

---

## Project Structure

```
wcwiki/
├── src/
│   ├── app/          # Next.js App Router pages & API routes
│   ├── components/   # React components (search, cards, editor, layout)
│   ├── hooks/        # Custom React hooks
│   ├── i18n/         # Internationalization config
│   ├── lib/          # Utilities (auth, DB, search, storage, schema)
│   └── types/        # TypeScript type definitions
├── prisma/           # Database schema & seeds
├── messages/         # Translation files (10 locales)
├── public/           # Static assets
├── scripts/          # Build & maintenance scripts
├── docs/             # Project documentation
├── ai/               # AI agent session starters
├── docker-compose.yml      # Development services
├── docker-compose.prod.yml # Production stack
├── Dockerfile              # Multi-stage production build
├── entrypoint.sh           # Container startup script
└── nginx.conf              # Reverse proxy configuration
```

---

## Content Publishing

Content (artists, paintings, articles) is managed via the Content API.
See [docs/API.md](docs/API.md) for endpoint reference and
[content/PUBLISHING-GUIDE.md](content/PUBLISHING-GUIDE.md) for step-by-step publishing workflows.

---

## License

Private — all rights reserved.
