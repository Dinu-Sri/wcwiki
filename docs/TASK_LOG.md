# Task Log — wcWIKI

> **Running log of all production changes with rollback notes.**
> Add a new entry for every code change pushed to master.
> Canonical instructions: `AGENTS.md`

---

## Format

| Date | Task | Files Changed | Env Vars | DB Migration | Redeploy | Rollback |
|------|------|--------------|----------|-------------|----------|----------|
| YYYY-MM-DD | Brief description | Key files | Added/Changed | Steps | Yes/No | How to undo |

---

## Log

| Date | Task | Files Changed | Env Vars | DB Migration | Redeploy | Rollback |
|------|------|--------------|----------|-------------|----------|----------|
| 2026-06-09 | Make Prisma baseline fallback discover migration directory dynamically | entrypoint.sh, docs/KNOWN_ERRORS.md | None | Marks first packaged migration as applied if needed | Yes | Revert commit after production DB is baselined |
| 2026-06-09 | Add Prisma production baseline fallback for P3005 | entrypoint.sh, docs/KNOWN_ERRORS.md | None | Marks existing initial migration as applied if needed | Yes | Revert commit after production DB is baselined |
| 2026-06-09 | Fix SEO sitemap and schema canonical URLs | src/app/sitemap.ts, src/app/robots.ts, src/lib/schema.ts | None | None | Yes | Revert SEO sitemap/schema commit |
| 2026-06-07 | Phase 0 stability: safe migrations, backups, staging DB | entrypoint.sh, prisma/migrations/20260607000000_initial_schema/, scripts/backup-db.sh, docker-compose.yml, package.json | None | Initial migration generated | Yes (entrypoint.sh changed) | Revert commit, restore original entrypoint.sh |
| 2026-06-06 | Complete system overview doc for research AI agents | docs/SYSTEM_OVERVIEW.md | None | None | No | Revert commit |
| 2026-06-06 | AI agent memory system setup | AGENTS.md, .github/copilot-instructions.md, docs/*, .gitignore, .env.example, README.md, .github/workflows/production-check.yml | None (docs only) | None | No | Revert commit |
| — | *(previous changes not logged — start logging from here)* | — | — | — | — | — |

---

## Key

- **ENV: None** = No environment variable changes needed
- **DB: None** = No database migration needed
- **REDEPLOY: No** = No Portainer redeploy needed (docs/config changes only)
- **REDEPLOY: Yes** = Portainer stack needs "Update the stack"
- **REDEPLOY: Image** = New GHCR image must be pulled and deployed

---

*Last updated: 2026-06-06*
