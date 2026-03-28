# wcWIKI Content API v1

Base URL: `https://wcwiki.com/api/v1`

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer wk_your_api_key_here
```

API keys are created by the Super Admin in **Admin → API Keys**. Each key has specific permissions:

| Permission | Description |
|-----------|-------------|
| `read` | List and retrieve resources |
| `write` | Create and update resources |
| `delete` | Delete resources |

The full API key is only shown once at creation time.

---

## Response Format

All responses follow this shape:

```json
{
  "data": { ... },     // Single item or array
  "total": 100,        // For list endpoints
  "limit": 20,
  "offset": 0
}
```

Error responses:

```json
{
  "error": "Description of the error"
}
```

---

## Artists

### List Artists

```
GET /api/v1/artists?limit=20&offset=0&search=monet
```

**Query Parameters:**
- `limit` (int, max 100, default 20)
- `offset` (int, default 0)
- `search` (string, searches name and nationality)

**Permission:** `read`

### Get Artist

```
GET /api/v1/artists/{id_or_slug}
```

Returns artist with list of their paintings.

**Permission:** `read`

### Create Artist

```
POST /api/v1/artists
Content-Type: application/json

{
  "name": "J.M.W. Turner",           // required
  "bio": "English Romantic painter...",
  "nationality": "British",
  "birthYear": 1775,
  "deathYear": 1851,
  "styles": ["Watercolor", "Romanticism"],
  "image": "/uploads/artists/turner.webp",
  "website": "https://example.com",
  "socialLinks": { "instagram": "@turner" },
  "references": [{"title": "Wikipedia", "url": "..."}]
}
```

Slug is auto-generated from `name`.

**Permission:** `write`

### Update Artist

```
PATCH /api/v1/artists/{id}
Content-Type: application/json

{
  "bio": "Updated biography text...",
  "styles": ["Watercolor", "Romanticism", "Landscape"]
}
```

**Updatable fields:** `name`, `bio`, `nationality`, `birthYear`, `deathYear`, `styles`, `image`, `website`, `socialLinks`, `references`

**Permission:** `write`

### Delete Artist

```
DELETE /api/v1/artists/{id}
```

**Warning:** Also deletes all paintings by this artist (cascade).

**Permission:** `delete`

---

## Paintings

### List Paintings

```
GET /api/v1/paintings?limit=20&offset=0&search=sunset&artistId=clxyz123
```

**Query Parameters:**
- `limit`, `offset`, `search` (title/medium)
- `artistId` — filter by artist

**Permission:** `read`

### Get Painting

```
GET /api/v1/paintings/{id_or_slug}
```

**Permission:** `read`

### Create Painting

```
POST /api/v1/paintings
Content-Type: application/json

{
  "title": "The Fighting Temeraire",  // required
  "artistId": "clxyz123",             // required
  "description": "Oil on canvas...",
  "medium": "Watercolor",
  "surface": "Paper",
  "width": 91.4,
  "height": 122.0,
  "year": 1839,
  "tags": ["seascape", "ship"],
  "images": ["/uploads/paintings/temeraire.webp"],
  "sourceUrl": "https://example.com/source",
  "attribution": "Public domain"
}
```

**Permission:** `write`

### Update Painting

```
PATCH /api/v1/paintings/{id}
Content-Type: application/json

{
  "description": "Updated description...",
  "tags": ["seascape", "ship", "sunset"]
}
```

**Updatable fields:** `title`, `description`, `medium`, `surface`, `width`, `height`, `year`, `tags`, `images`, `sourceUrl`, `attribution`

**Permission:** `write`

### Delete Painting

```
DELETE /api/v1/paintings/{id}
```

**Permission:** `delete`

---

## Articles

### List Articles

```
GET /api/v1/articles?limit=20&offset=0&search=technique&status=APPROVED
```

**Query Parameters:**
- `limit`, `offset`, `search` (title/tags)
- `status` — `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`

**Permission:** `read`

### Get Article

```
GET /api/v1/articles/{id_or_slug}
```

**Permission:** `read`

### Create Article

```
POST /api/v1/articles
Content-Type: application/json

{
  "title": "Watercolor Techniques for Beginners",  // required
  "body": "<p>Rich HTML content...</p>",            // required
  "tags": ["technique", "beginner"],
  "excerpt": "A comprehensive guide to...",
  "language": "en",
  "status": "APPROVED",
  "references": [{"title": "Source", "url": "..."}]
}
```

Articles default to `DRAFT` status. Set `status: "APPROVED"` to publish immediately.

**Permission:** `write`

### Update Article

```
PATCH /api/v1/articles/{id}
Content-Type: application/json

{
  "body": "<p>Updated content...</p>",
  "status": "APPROVED"
}
```

Setting `status` to `APPROVED` auto-sets `publishedAt`.

**Updatable fields:** `title`, `body`, `tags`, `excerpt`, `language`, `references`, `status`

**Permission:** `write`

### Delete Article

```
DELETE /api/v1/articles/{id}
```

**Permission:** `delete`

---

## Media

### List Media

```
GET /api/v1/media?limit=20&offset=0&subfolder=paintings
```

**Query Parameters:**
- `limit`, `offset`
- `subfolder` — filter by folder (e.g., `paintings`, `articles`, `general`)

**Permission:** `read`

---

## Rate Limits

Currently no rate limits are enforced. Be respectful with usage.

## MeiliSearch Sync

All create/update/delete operations on Artists, Paintings, and Articles automatically sync to MeiliSearch for instant search indexing.

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (missing required fields) |
| 401 | Invalid or missing API key |
| 403 | Missing required permission |
| 404 | Resource not found |
| 500 | Internal server error |
