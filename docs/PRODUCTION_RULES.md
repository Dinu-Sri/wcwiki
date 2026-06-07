# Production Rules — wcWIKI

> **These are hard rules. Every change must comply.**
> Canonical instructions: `AGENTS.md`

---

## Rule 1: Environment Variables Only

**All** configuration comes from environment variables. Never hardcode:
- URLs (localhost, production domains, API endpoints)
- File paths (uploads directory, log paths, cert paths)
- Credentials (passwords, API keys, tokens, secrets)
- Connection strings (database, Meilisearch, Redis)

```typescript
// ❌ WRONG
const dbUrl = "postgresql://wcwiki:password@localhost:5432/wcwiki";
const searchHost = "http://localhost:7700";

// ✅ CORRECT
const dbUrl = process.env.DATABASE_URL;
const searchHost = process.env.MEILISEARCH_HOST;
```

---

## Rule 2: Prisma Migrations Must Be Documented

Any change to `prisma/schema.prisma` requires:
1. The migration command documented in commit message (`DB:` field)
2. Entry in `docs/TASK_LOG.md` with rollback notes
3. Manual `prisma db push` or `prisma migrate dev` tested locally first

**Warning**: `entrypoint.sh` runs `prisma db push --accept-data-loss` on every container start.
This means destructive schema changes (dropping columns/tables) WILL cause data loss in production
if not carefully planned. Always backup the database before risky schema changes.

---

## Rule 3: Never Commit Secrets

Files that must NEVER be committed:
- `.env` (any variant: `.env.local`, `.env.production`, `.env.development`)
- `*.pem`, `*.key`, `*.crt` (SSL certificates)
- Any file containing real passwords, tokens, or API keys

The `.gitignore` must block all of these. Verify before every commit:
```bash
git status  # Check no .env files are staged
```

---

## Rule 4: Content Encoding Rules

When publishing content via the Content API (especially from PowerShell):

### Article Body (HTML)
- **Use HTML entities** for special characters:
  - Em dash: `&mdash;` instead of `—`
  - En dash: `&ndash;` instead of `–`
  - Pound sign: `&pound;` instead of `£`
  - Smart quotes: `&ldquo;` `&rdquo;` instead of `"` `"`
- Root cause: `Invoke-RestMethod` in PowerShell doesn't preserve multi-byte Unicode

### Excerpt (Plain Text)
- **ASCII only** — no special characters, no HTML

---

## Rule 5: Image Upload Limits

- **Max file size**: 10MB
- **Auto-conversion**: All uploads converted to WebP
- **Allowed formats**: JPEG, PNG, WebP, GIF, AVIF
- **Storage**: Cloudflare R2 (`R2_BUCKET_NAME`)
- **Public URL**: `https://images.wcwiki.org`
- Always resize large images locally before uploading

---

## Rule 6: Search Auto-Suggest Quality Rules

Auto-suggest MUST follow these rules (see `docs/SEARCH-RULES.md` for full spec):
- Source: **Past user queries only** (from DB `SearchQuery` table), NOT content titles
- Minimum query length: 3 characters
- Minimum occurrences: 2 (or 1 for trending)
- Time window: 90 days (7 days for trending)
- No repeated characters (`aaa`, `ttt`)
- Case-insensitive deduplication
- Maximum 8 items in dropdown
- Never show entity types (Artist, Painting, Article) in suggestions
- Never navigate directly from suggestions — always search first

---

## Rule 7: Preserve Existing Features

- Do not remove or rewrite working features without explicit instruction
- Do not change the API contract (endpoint paths, request/response shapes)
- Do not change URL structures (these affect SEO and existing links)
- Do not remove or rename database columns without migration documentation

---

## Rule 8: i18n Rules

- All user-facing UI strings must use `next-intl` translation keys
- New translation keys must be added to ALL 10 locale files in `messages/`
- If you can't provide translations, add the English string and mark other locales with `// TODO: translate`
- Locale routing: `localePrefix: "as-needed"` (English has no prefix, others do: `/ja/`, `/fr/`, etc.)

---

## Rule 9: Build Must Succeed Before Push

```bash
npm run lint   # Must pass
npm run build  # Must succeed
```

A broken build on master will block deployment. The GitHub Actions `production-check` workflow
enforces this on PRs. The `docker-image.yml` workflow enforces this on push to master.

---

## Rule 10: Performance & Security

- All images served through Next.js `<Image>` component (not raw `<img>`)
- Sharp enabled for AVIF/WebP optimization
- Nginx adds HSTS, X-Frame-Options, X-Content-Type-Options headers
- API routes must validate auth before processing
- Rate limiting should be considered for public API endpoints
- No inline scripts in rendered HTML (CSP compliance)

---

*Last updated: 2026-06-06*
