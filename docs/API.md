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
  "coverImage": "/uploads/articles/cover.webp",
  "tags": ["technique", "beginner"],
  "excerpt": "A comprehensive guide to...",
  "language": "en",
  "status": "APPROVED",
  "references": [{"title": "Source", "url": "..."}]
}
```

Articles default to `DRAFT` status. Set `status: "APPROVED"` to publish immediately.

**Embedding images in article body:** Use standard HTML `<img>` tags in the `body` field:

```html
<figure>
  <img src="/uploads/articles/my-image.webp" alt="Description" style="max-width:100%;" />
  <figcaption>Caption text</figcaption>
</figure>
```

Upload the image first via `POST /api/v1/upload`, then use the returned `url` in your HTML.

**Permission:** `write`

### Update Article

```
PATCH /api/v1/articles/{id}
Content-Type: application/json

{
  "body": "<p>Updated content...</p>",
  "coverImage": "/uploads/articles/new-cover.webp",
  "status": "APPROVED"
}
```

Setting `status` to `APPROVED` auto-sets `publishedAt`.

**Updatable fields:** `title`, `body`, `coverImage`, `tags`, `excerpt`, `language`, `references`, `status`

**Permission:** `write`

### Delete Article

```
DELETE /api/v1/articles/{id}
```

**Permission:** `delete`

---

## Media / Upload

### Upload Image

Upload an image file from your local machine. Returns the hosted URL.

```
POST /api/v1/upload
Content-Type: multipart/form-data

Form fields:
  file       — (required) The image file (JPEG, PNG, WebP, GIF, AVIF, max 10MB)
  subfolder  — (optional) Where to store: "paintings", "articles", "general", "profiles" (default: "general")
  alt        — (optional) Alt text for the image
```

**Response (201):**

```json
{
  "data": {
    "id": "clxyz123",
    "url": "/uploads/paintings/my-image_1711234567890.webp",
    "width": 800,
    "height": 600,
    "size": 45230,
    "format": "webp"
  }
}
```

Images are automatically converted to WebP, resized to max 2000px width, quality 80.

**Permission:** `write`

**Example (curl):**

```bash
curl -X POST http://your-server/api/v1/upload \
  -H "Authorization: Bearer wk_your_key" \
  -F "file=@/path/to/painting.jpg" \
  -F "subfolder=paintings" \
  -F "alt=Sunset watercolor painting"
```

**Example (Node.js):**

```javascript
import fs from 'fs';

const form = new FormData();
const blob = new Blob([fs.readFileSync('painting.jpg')], { type: 'image/jpeg' });
form.append('file', blob, 'painting.jpg');
form.append('subfolder', 'paintings');
form.append('alt', 'Sunset watercolor');

const res = await fetch('http://your-server/api/v1/upload', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer wk_your_key' },
  body: form,
});
const { data } = await res.json();
console.log(data.url); // /uploads/paintings/painting_1711234567890.webp
```

### List Uploaded Media

```
GET /api/v1/upload?limit=20&offset=0&subfolder=paintings
```

**Query Parameters:**
- `limit` (int, max 100, default 20)
- `offset` (int, default 0)
- `subfolder` — filter by folder (e.g., `paintings`, `articles`, `general`)

**Response:**

```json
{
  "data": [
    {
      "id": "clxyz123",
      "url": "/uploads/paintings/image_123.webp",
      "filename": "original-name.jpg",
      "alt": "Description",
      "width": 800,
      "height": 600,
      "size": 45230,
      "format": "webp",
      "subfolder": "paintings",
      "createdAt": "2026-03-28T10:00:00.000Z"
    }
  ],
  "total": 7,
  "limit": 20,
  "offset": 0
}
```

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

---

## Common Workflows

### Upload an image and attach it to a painting

```bash
# Step 1: Upload the image
curl -X POST http://your-server/api/v1/upload \
  -H "Authorization: Bearer wk_your_key" \
  -F "file=@sunset-painting.jpg" \
  -F "subfolder=paintings" \
  -F "alt=Sunset over the sea"
# Returns: { "data": { "url": "/uploads/paintings/sunset_123.webp", ... } }

# Step 2: Attach it to the painting
curl -X PATCH http://your-server/api/v1/paintings/PAINTING_ID \
  -H "Authorization: Bearer wk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"images": ["/uploads/paintings/sunset_123.webp"]}'
```

### Upload an image and set it as article cover + inline

```bash
# Step 1: Upload
curl -X POST http://your-server/api/v1/upload \
  -H "Authorization: Bearer wk_your_key" \
  -F "file=@brushes.jpg" \
  -F "subfolder=articles"
# Returns: { "data": { "url": "/uploads/articles/brushes_123.webp", ... } }

# Step 2: Set as cover image
curl -X PATCH http://your-server/api/v1/articles/ARTICLE_ID \
  -H "Authorization: Bearer wk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"coverImage": "/uploads/articles/brushes_123.webp"}'

# Step 3: Insert into article body (include existing body + new img)
curl -X PATCH http://your-server/api/v1/articles/ARTICLE_ID \
  -H "Authorization: Bearer wk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"body": "<figure><img src=\"/uploads/articles/brushes_123.webp\" /></figure><p>Rest of article...</p>"}'
```

### Create a full article with images (Node.js)

```javascript
import fs from 'fs';

const API = 'http://your-server/api/v1';
const KEY = 'wk_your_key';
const headers = { 'Authorization': `Bearer ${KEY}` };

// 1. Upload cover image
const form = new FormData();
form.append('file', new Blob([fs.readFileSync('cover.jpg')], { type: 'image/jpeg' }), 'cover.jpg');
form.append('subfolder', 'articles');
const upload = await (await fetch(`${API}/upload`, { method: 'POST', headers, body: form })).json();

// 2. Create article with cover and inline image
const article = await (await fetch(`${API}/articles`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Article',
    coverImage: upload.data.url,
    body: `<h2>Introduction</h2><p>Text here...</p>
           <figure><img src="${upload.data.url}" alt="Cover" style="max-width:100%" /></figure>
           <p>More text...</p>`,
    tags: ['watercolor', 'tutorial'],
    status: 'APPROVED',
  }),
})).json();

console.log('Created:', article.data.slug);
```
