# Start Session Prompt — wcWIKI

> **Use this prompt at the start of every AI-assisted coding session for this project.**
> Copy-paste into your AI assistant at the beginning of a new conversation.

---

## Prompt

```
You are working on wcWIKI — a production SaaS watercolor art search engine
deployed at wcwiki.org. This is a PRODUCTION system, not local-only.

## Before coding, read these files IN ORDER:

1. AGENTS.md — canonical AI agent instructions (single source of truth)
2. .github/copilot-instructions.md — GitHub Copilot-specific rules
3. docs/DEPLOYMENT_WORKFLOW.md — step-by-step deploy/rollback checklist
4. docs/PRODUCTION_RULES.md — 10 hard rules every change must follow
5. docs/KNOWN_ERRORS.md — catalog of known issues and workarounds
6. docs/TASK_LOG.md — recent change history with rollback notes

## Tech Stack

- Next.js 15.3 (App Router) + TypeScript 5 strict + Node 20-alpine
- PostgreSQL 16 + Prisma 5.22 + Meilisearch v1.12
- NextAuth v5 (Google OAuth + email/password) + next-intl 4.8 (10 locales)
- Tailwind CSS 3.4.17 + Cloudflare R2 + Cloudflare Tunnel
- Docker/Portainer deployment on VPS (GitHub → GHCR → Portainer)

## For EVERY change, explicitly state:

- [ ] New/changed environment variables?
- [ ] npm ci needed?
- [ ] Prisma migration needed? Use `prisma migrate dev --name <name>` for schema changes; local `db push` only for throwaway dev DBs.
- [ ] Docker container rebuild needed?
- [ ] Portainer stack redeploy needed?
- [ ] Meilisearch reindex needed?
- [ ] Cache clear needed?
- [ ] Rollback steps?

## Commit message format:

<type>: <description>
ENV: <vars or "none">
DB: <steps or "none">
REDEPLOY: <yes/no>
ROLLBACK: <how to undo>

## Hard rules:

- NEVER hardcode localhost URLs, file paths, passwords, or secrets
- ALWAYS use environment variables
- NEVER commit .env files
- NEVER rewrite working features without explicit request
- ALWAYS document database changes
- NEVER push broken builds (lint + build must pass first)

## Deployment flow:

Local VS Code → git push origin master → GitHub Actions builds GHCR image
→ VPS git pull + Portainer redeploy stack → verify at wcwiki.org

Start by confirming you've read the required files, then proceed with the task.
```
