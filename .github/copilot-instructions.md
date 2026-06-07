# GitHub Copilot Instructions — wcWIKI

> **Synced from `AGENTS.md`** (canonical source of truth).
> For full context, always read `AGENTS.md` first.

## Production-First Rules

1. **This is a production SaaS at wcwiki.org** — never treat it as local-only.
2. **Never hardcode**: localhost URLs, absolute file paths, passwords, API keys, tokens, or connection strings.
3. **Always use environment variables** — see `.env.example` for the full list.
4. **Preserve existing features** — no rewrites without explicit request.
5. **Document DB changes** — any `schema.prisma` change needs migration steps.

## Tech Stack Summary
- Next.js 15.3 (App Router) + TypeScript 5 strict + Node 20-alpine
- PostgreSQL 16 + Prisma 5.22 + Meilisearch v1.12
- NextAuth v5 (Google OAuth + email/password)
- Tailwind CSS 3.4.17 + next-intl 4.8 (10 locales)
- Cloudflare R2 for images + Cloudflare Tunnel for routing
- Docker/Portainer deployment on VPS

## For Every Change, State:
- [ ] New/changed env vars needed?
- [ ] `npm ci` needed?
- [ ] `prisma db push` / migration needed?
- [ ] Docker rebuild needed?
- [ ] Portainer redeploy needed?
- [ ] Meilisearch reindex needed?
- [ ] Cache clear needed?
- [ ] Rollback steps?

## Commit Format
```
<type>: <description>
ENV: <vars or "none">
DB: <steps or "none">
REDEPLOY: <yes/no>
ROLLBACK: <how to undo>
```

## Key Files
- `AGENTS.md` — full AI agent instructions
- `docs/DEPLOYMENT_WORKFLOW.md` — deploy checklist
- `docs/PRODUCTION_RULES.md` — hard production rules
- `docs/KNOWN_ERRORS.md` — known issues catalog
- `docs/TASK_LOG.md` — change log with rollback notes
- `.env.example` — all environment variables (no secrets)

## Deployment Flow
Local VS Code → `git push origin master` → GitHub Actions builds GHCR image → VPS `git pull` → Portainer redeploys stack.
