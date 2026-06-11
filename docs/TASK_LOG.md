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
| 2026-06-11 | Fix dashboard Docker prerender failure and add SUPER_ADMIN app log API for OpenAI/reference errors | src/app/dashboard/layout.tsx, src/app/[locale]/dashboard/layout.tsx, src/lib/app-logger.ts, src/app/api/admin/logs/route.ts, src/app/api/painting-references/suggest-metadata/route.ts, src/app/api/painting-references/route.ts, .env.example, AGENTS.md, docs/DEPLOYMENT_WORKFLOW.md | Added optional APP_LOG_DIR | None | Yes | Revert this commit; remove APP_LOG_DIR if set |
| 2026-06-11 | Fix production DYNAMIC_SERVER_USAGE render error from root layout request-bound locale lookup | src/app/layout.tsx, docs/TASK_LOG.md | None | None | Yes | Revert this commit to restore request-derived root html lang |
| 2026-06-11 | Fix painting reference upload UX with per-image metadata, image removal, and clearer AI provider fallback errors | src/components/references/PaintingReferenceUploadForm.tsx, src/app/api/painting-references/route.ts, src/app/api/painting-references/suggest-metadata/route.ts | None | None | Yes | Revert this commit; the previous shared-metadata upload flow will return |
| 2026-06-11 | Fix production Prisma fallback for painting reference short codes and add AI metadata suggestions | prisma/schema.prisma, prisma/migrations/20260607000000_initial_schema/migration.sql, prisma/migrations/20260611110000_reference_shortcode_nonunique/, src/app/api/painting-references/suggest-metadata/route.ts, src/app/api/painting-references/route.ts, src/components/references/PaintingReferenceUploadForm.tsx, .env.example, AGENTS.md, docs/DEPLOYMENT_WORKFLOW.md, docs/KNOWN_ERRORS.md | Added OPENAI_API_KEY; optional OPENAI_VISION_MODEL and OPENAI_METADATA_DAILY_LIMIT | New migration 20260611110000_reference_shortcode_nonunique changes shortCode from unique to indexed; production fallback remains non-destructive db push | Yes | Revert this commit; remove OPENAI env vars if unused; if needed after backup drop PaintingReference_shortCode_idx only after confirming no code uses short redirects |
| 2026-06-11 | Improve Painting Reference attribution, short redirects, upload metadata, lightbox, dashboard saved list, and roadmap next-phase notes | prisma/schema.prisma, prisma/migrations/20260611083000_reference_metadata_shortlinks/, src/app/r/[code]/route.ts, src/app/[locale]/painting-references/*, src/app/api/painting-references/route.ts, src/components/references/*, src/app/[locale]/dashboard/page.tsx, src/app/[locale]/page.tsx, docs/WCWIKI_FUTURE_PROOF_EXPANSION_ROADMAP.md | None | New migration 20260611083000_reference_metadata_shortlinks adds shortCode/country/city/takenAt to PaintingReference | Yes | Revert this commit; if needed after backup drop the added columns and shortCode index |
| 2026-06-10 | Clean homepage painting reference UI labels and remove category filter pills | src/app/[locale]/page.tsx, src/components/layout/Header.tsx, src/components/layout/MobileNav.tsx, src/components/layout/Footer.tsx, src/app/[locale]/admin/layout.tsx, src/app/[locale]/admin/page.tsx, src/app/[locale]/dashboard/page.tsx | None | None | Yes | Revert this UI cleanup commit |
| 2026-06-10 | Add Painting References library MVP with submission, approval, saves, SEO, and sitemap hooks | prisma/schema.prisma, prisma/migrations/20260610090000_painting_references/, src/app/[locale]/painting-references/*, src/app/api/painting-references/*, src/app/api/admin/painting-references/*, src/components/references/*, src/app/sitemap.ts, src/app/llms.txt/route.ts, layout/dashboard/nav files | None | New migration 20260610090000_painting_references; production startup may still use documented non-destructive db push fallback until migration history is repaired | Yes | Revert this commit; if tables were created, remove PaintingReference/ReferenceCategory/ReferenceSave data after backup |
| 2026-06-09 | Document temporary Prisma startup fallback and future migration-history repair plan | AGENTS.md, docs/DEPLOYMENT_WORKFLOW.md, docs/PRODUCTION_RULES.md, docs/KNOWN_ERRORS.md, ai/AI_CONTEXT.generated.md | None | None | No | Revert documentation commit |
| 2026-06-09 | Restore production startup with non-destructive Prisma db push fallback | entrypoint.sh, docs/KNOWN_ERRORS.md | None | Falls back to prisma db push --skip-generate if migrate deploy fails | Yes | Revert commit after production DB migration history is repaired |
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

*Last updated: 2026-06-11*
