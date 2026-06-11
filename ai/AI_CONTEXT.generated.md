# AI Context Summary — wcWIKI

> **GENERATED from `AGENTS.md` — do not edit directly.**
> Quick orientation for AI agents. For full rules, read `AGENTS.md`.

---

## What is wcWIKI?

A production SaaS watercolor art search engine at **wcwiki.org** with artist profiles,
painting galleries, community articles, and 10-language support.

## Tech Stack

Next.js 15.3 (App Router) + TypeScript 5 + Node 20-alpine + PostgreSQL 16 +
Prisma 5.22 + Meilisearch v1.12 + NextAuth v5 + Tailwind CSS 3.4.17 +
next-intl 4.8 + Cloudflare R2 + Cloudflare Tunnel + Docker/Portainer

## Deployment

Local → `git push origin master` → GitHub Actions → GHCR image →
VPS `git pull` → Portainer redeploy → wcwiki.org

Startup DB behavior: `entrypoint.sh` runs `prisma migrate deploy` first. The live
production DB predates Prisma migration history, so startup temporarily falls back
to non-destructive `prisma db push --skip-generate` if deploy fails. Do not add
`--accept-data-loss`. Remove this fallback only after production migration history
is repaired in a maintenance window. Avoid schema changes that make fallback
`db push` require `--accept-data-loss`.

Painting reference AI metadata suggestions are click-triggered only and require
`OPENAI_API_KEY`. `OPENAI_VISION_MODEL` is optional and defaults to `gpt-5.4-mini`.
`OPENAI_METADATA_DAILY_LIMIT` defaults to 10. The server resizes images before
sending low-detail vision requests.

## 10 Hard Rules

1. Environment variables only — no hardcoded values
2. Document all Prisma migrations
3. Never commit .env files or secrets
4. Use HTML entities in article body (PowerShell UTF-8 bug)
5. Image uploads: max 10MB, auto-WebP, Cloudflare R2
6. Follow search auto-suggest quality rules
7. Preserve existing features — no unnecessary rewrites
8. All UI strings use next-intl (10 locales)
9. Build must pass (`npm run lint` + `npm run build`) before push
10. Performance & security best practices

## Change Checklist

Env vars? · npm ci? · DB migration? · Docker rebuild? · Portainer redeploy?
Meilisearch reindex? · Cache clear? · Rollback steps?

## Key Files

- `AGENTS.md` — full instructions
- `.env.example` — all env vars
- `docs/DEPLOYMENT_WORKFLOW.md` — deploy checklist
- `docs/PRODUCTION_RULES.md` — hard rules
- `docs/KNOWN_ERRORS.md` — known issues
- `docs/TASK_LOG.md` — change log
- `ai/start-session.prompt.md` — session starter prompt

---

*Generated 2026-06-11 from AGENTS.md*
