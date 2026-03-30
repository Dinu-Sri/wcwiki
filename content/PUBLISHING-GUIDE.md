# wcWIKI Content Publishing Guide

> Complete reference for publishing articles, artists, and paintings to the wcWIKI production site via the v1 API.

**Production URL:** `http://109.199.125.98:3001`
**API Key:** Bearer token via `Authorization: Bearer wk_...`

---

## Table of Contents

1. [Quick Reference](#1-quick-reference)
2. [Image Upload Workflow](#2-image-upload-workflow)
3. [Publishing an Artist](#3-publishing-an-artist)
4. [Publishing Paintings](#4-publishing-paintings)
5. [Publishing an Article](#5-publishing-an-article)
6. [Encoding Rules (CRITICAL)](#6-encoding-rules-critical)
7. [Embedding Images in Article Body](#7-embedding-images-in-article-body)
8. [Downloading Images from Wikimedia Commons](#8-downloading-images-from-wikimedia-commons)
9. [Known Issues and Fixes](#9-known-issues-and-fixes)
10. [Complete Workflow Example](#10-complete-workflow-example)
11. [API Reference](#11-api-reference)

---

## 1. Quick Reference

| Entity   | Endpoint                    | Required Fields          | Method |
|----------|-----------------------------|--------------------------|--------|
| Upload   | `POST /api/v1/upload`       | `file` (FormData)        | POST   |
| Artist   | `POST /api/v1/artists`      | `name`                   | POST   |
| Painting | `POST /api/v1/paintings`    | `title`, `artistId`      | POST   |
| Article  | `POST /api/v1/articles`     | `title`, `body`          | POST   |
| Update   | `PATCH /api/v1/articles/[id]` | any allowed field      | PATCH  |
| Delete   | `DELETE /api/v1/articles/[id]` | -                     | DELETE |

All endpoints require: `Authorization: Bearer wk_<key>`

---

## 2. Image Upload Workflow

### Endpoint
```
POST /api/v1/upload
Content-Type: multipart/form-data
```

### Parameters
| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `file`     | File   | Yes      | Image file (JPEG, PNG, WebP, GIF, AVIF) |
| `subfolder`| String | No       | Subfolder in R2: `articles`, `artists`, `paintings`, `general` |
| `alt`      | String | No       | Alt text for the image |

### Constraints
- **Max file size: 10MB** (files over 10MB must be resized locally first)
- Allowed types: JPEG, PNG, WebP, GIF, AVIF
- Images are auto-converted to WebP on the server
- Returns URL path like `/uploads/paintings/filename_timestamp.webp`

### PowerShell Upload Template
```powershell
$baseUrl = "http://109.199.125.98:3001"
$apiKey  = "wk_<your-key>"

$filePath = "C:\path\to\image.jpg"
$boundary = [Guid]::NewGuid().ToString()
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "multipart/form-data; boundary=$boundary"
}

$fileBytes   = [System.IO.File]::ReadAllBytes($filePath)
$fileEncoded = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"image.jpg`"",
    "Content-Type: image/jpeg",
    "",
    $fileEncoded,
    "--$boundary",
    "Content-Disposition: form-data; name=`"subfolder`"",
    "",
    "paintings",
    "--$boundary",
    "Content-Disposition: form-data; name=`"alt`"",
    "",
    "Description of the image",
    "--$boundary--"
)

$bodyStr   = $bodyLines -join "`r`n"
$bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($bodyStr)
$resp = Invoke-RestMethod -Uri "$baseUrl/api/v1/upload" -Method POST -Headers $headers -Body $bodyBytes
Write-Host "Uploaded: $($resp.data.url)"
```

### Resizing Large Images (>10MB)
```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\path\to\large-image.jpg")
$maxWidth = 3000
$ratio = $maxWidth / $img.Width
$newHeight = [int]($img.Height * $ratio)
$newBmp = New-Object System.Drawing.Bitmap($maxWidth, $newHeight)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $maxWidth, $newHeight)
$g.Dispose(); $img.Dispose()

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
$newBmp.Save("C:\path\to\resized.jpg", $encoder, $encParams)
$newBmp.Dispose()
```

---

## 3. Publishing an Artist

### Endpoint
```
POST /api/v1/artists
Content-Type: application/json
```

### Fields
| Field         | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `name`        | String   | Yes      | Artist's full name |
| `bio`         | String   | No       | Biography text |
| `nationality` | String   | No       | e.g., "British" |
| `birthYear`   | Number   | No       | e.g., 1775 |
| `deathYear`   | Number   | No       | e.g., 1851 |
| `styles`      | String[] | No       | e.g., ["Watercolour", "Oil"] |
| `image`       | String   | No       | Uploaded portrait URL |
| `references`  | Object[] | No       | Array of {title, url} |

### Workflow
1. Upload portrait image via `/api/v1/upload` with `subfolder=artists`
2. Create artist via POST with all fields

### Example
```powershell
$artist = @{
    name        = "J.M.W. Turner"
    bio         = "Joseph Mallord William Turner RA was an English Romantic painter..."
    nationality = "British"
    birthYear   = 1775
    deathYear   = 1851
    styles      = @("Watercolour", "Oil", "Romanticism")
    image       = "/uploads/artists/turner-portrait_123456.webp"
    references  = @(
        @{ title = "Wikipedia"; url = "https://en.wikipedia.org/wiki/J._M._W._Turner" }
    )
}
$json = $artist | ConvertTo-Json -Depth 3
$resp = Invoke-RestMethod -Uri "$baseUrl/api/v1/artists" -Method POST `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $apiKey" }
# Returns: $resp.data.id (use for paintings), $resp.data.slug
```

**Note:** Slug is auto-generated from the name. Artist ID is needed for creating linked paintings.

---

## 4. Publishing Paintings

### Endpoint
```
POST /api/v1/paintings
Content-Type: application/json
```

### Fields
| Field         | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `title`       | String   | Yes      | Painting title |
| `artistId`    | String   | Yes      | ID from artist creation |
| `description` | String   | No       | Painting description |
| `medium`      | String   | No       | e.g., "Watercolour on paper" |
| `surface`     | String   | No       | e.g., "paper", "canvas" |
| `width`       | Number   | No       | Width in cm |
| `height`      | Number   | No       | Height in cm |
| `year`        | Number   | No       | Year created |
| `tags`        | String[] | No       | Searchable tags |
| `images`      | String[] | No       | Array of uploaded image URLs |
| `sourceUrl`   | String   | No       | Original source URL |
| `attribution` | String   | No       | Copyright/license info |

### Workflow
1. Download source images locally (see Section 8)
2. Resize if >10MB (see Section 2)
3. Upload each image via `/api/v1/upload` with `subfolder=paintings`
4. Create painting via POST with uploaded URL in `images` array

### Example
```powershell
$painting = @{
    title       = "The Red Rigi: Lake Lucerne, Sunrise"
    artistId    = "cmnbpjo4f001fnkxmilprf8ko"
    year        = 1842
    description = "One of Turner's finest Swiss watercolours..."
    medium      = "Watercolour on paper"
    tags        = @("landscape", "Swiss Alps", "lake", "sunrise")
    images      = @("/uploads/paintings/the-red-rigi_123456.webp")
    sourceUrl   = "https://commons.wikimedia.org/wiki/File:..."
    attribution = "J.M.W. Turner, Public domain, via Wikimedia Commons"
}
$json = $painting | ConvertTo-Json -Depth 3
$resp = Invoke-RestMethod -Uri "$baseUrl/api/v1/paintings" -Method POST `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $apiKey" }
```

### Batch Publishing Pattern
```powershell
$artistId = "cmnbpjo4f001fnkxmilprf8ko"
$paintings = @(
    @{ title="Painting 1"; year=1840; images=@("/uploads/paintings/p1.webp"); ... },
    @{ title="Painting 2"; year=1841; images=@("/uploads/paintings/p2.webp"); ... }
)
foreach ($p in $paintings) {
    $p["artistId"] = $artistId
    $json = $p | ConvertTo-Json -Depth 3
    $resp = Invoke-RestMethod -Uri "$baseUrl/api/v1/paintings" -Method POST `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $apiKey" }
    Write-Host "Published: $($resp.data.slug)"
    Start-Sleep -Milliseconds 300
}
```

---

## 5. Publishing an Article

### Endpoint
```
POST /api/v1/articles
Content-Type: application/json
```

### Fields
| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| `title`      | String | Yes      | Article title |
| `body`       | String | Yes      | HTML content (see encoding rules!) |
| `excerpt`    | String | No       | Plain text summary (ASCII only!) |
| `coverImage` | String | No       | Uploaded cover image URL |
| `category`   | String | No       | e.g., "ARTIST", "TECHNIQUE" |
| `status`     | String | No       | "APPROVED" to publish immediately |
| `references` | Object[]| No     | Array of {title, url, accessed} |

### Important Notes
- Set `status: "APPROVED"` to publish immediately (otherwise defaults to DRAFT)
- Body is HTML rendered via `dangerouslySetInnerHTML` -- see encoding rules in Section 6
- Excerpt is plain text rendered via React `{}` -- NO HTML entities!
- Slug is auto-generated from title

### Example
```powershell
$article = @{
    title      = "J.M.W. Turner: Master of Light"
    body       = "<h2>Early Life</h2><p>Turner was born in 1775...</p>"
    excerpt    = "A comprehensive exploration of Turner's life and artistic legacy."
    coverImage = "/uploads/articles/turner-portrait_123456.webp"
    category   = "ARTIST"
    status     = "APPROVED"
    references = @(
        @{ title = "Wikipedia"; url = "https://en.wikipedia.org/wiki/J._M._W._Turner"; accessed = "2025-01-20" }
    )
}
$json = $article | ConvertTo-Json -Depth 3
$resp = Invoke-RestMethod -Uri "$baseUrl/api/v1/articles" -Method POST `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $apiKey" }
```

---

## 6. Encoding Rules (CRITICAL)

### The Problem
PowerShell's `Invoke-RestMethod` mangles multi-byte UTF-8 characters (em-dashes, en-dashes, pound signs, accented characters). This happens even when using `[System.Text.Encoding]::UTF8.GetBytes()`.

### Rules for Article Body (HTML, `dangerouslySetInnerHTML`)
Use **HTML entities** for all non-ASCII characters:

| Character | Wrong          | Correct       |
|-----------|----------------|---------------|
| Em-dash   | `—` (U+2014)  | `&mdash;`     |
| En-dash   | `–` (U+2013)  | `&ndash;`     |
| Pound     | `£`            | `&pound;`     |
| Acute e   | `e` accent     | `&eacute;`    |
| Umlaut    | `u` umlaut     | `&uuml;`      |

Since the body is rendered as HTML, these entities are correctly decoded by the browser.

### Rules for Excerpt (Plain text, React `{}`)
Use **ASCII only**:
- No em-dashes or en-dashes -- use plain hyphens `-` or double hyphens `--`
- No special characters whatsoever
- HTML entities like `&mdash;` will show LITERALLY (not decoded)

### Rules for Painting/Artist Descriptions
Painting and artist descriptions are rendered as plain text, so:
- Use only ASCII characters
- No HTML entities (they'll show literally)
- Use plain hyphens instead of dashes

### Quick Test
After publishing, always check the live page for garbled characters like `â€"`, `â€™`, or `Ã©`. If found, PATCH the content with HTML entity equivalents (for body) or ASCII (for excerpt/descriptions).

---

## 7. Embedding Images in Article Body

### Upload First
Images must be uploaded to R2 before embedding. Use the upload endpoint (Section 2).

### Portrait/Float Style
For a portrait or small image floated to one side:
```html
<figure style="float:right; margin:0 0 1em 1.5em; max-width:340px; shape-outside:margin-box;">
  <img src="/uploads/articles/portrait_123456.webp"
       alt="Description"
       style="width:100%; height:auto; border-radius:8px;" />
  <figcaption style="font-size:0.85em; color:#666; margin-top:0.5em; text-align:center;">
    Caption text here
  </figcaption>
</figure>
```

### Full-Width Style
For a large painting or landscape image:
```html
<figure style="margin:1.5em 0; text-align:center;">
  <img src="/uploads/articles/painting_123456.webp"
       alt="Description"
       style="max-width:100%; height:auto; border-radius:8px;" />
  <figcaption style="font-size:0.85em; color:#666; margin-top:0.5em;">
    Caption text here
  </figcaption>
</figure>
```

### Notes
- Always use the `/uploads/...` path returned by the upload API
- Include descriptive `alt` text for accessibility
- Use `<figcaption>` for captions (not separate `<p>` tags)
- The server auto-converts to WebP, so URLs end in `.webp`

---

## 8. Downloading Images from Wikimedia Commons

### The Problem
Direct downloads from Wikimedia Commons often fail in PowerShell with 403 errors, HTML error pages (2KB files), or 0-byte files.

### Required Setup
```powershell
# MUST set TLS 1.2 (PowerShell defaults to older TLS versions)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

### Recommended Download Pattern
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Step 1: Get download URL from Wikimedia API (returns actual file URL + thumbnail)
$wikiFilename = "J._M._W._Turner_-_The_Red_Rigi_-_Google_Art_Project.jpg"
$enc = [System.Uri]::EscapeDataString($wikiFilename)
$apiUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:$enc&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json"

$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
$json = $wc.DownloadString($apiUrl)
$data = $json | ConvertFrom-Json
$pgid = ($data.query.pages.PSObject.Properties | Select-Object -First 1).Name
$thumbUrl = $data.query.pages.$pgid.imageinfo[0].thumburl  # 1600px version
$origUrl  = $data.query.pages.$pgid.imageinfo[0].url        # Full resolution

# Step 2: Download using WebClient with User-Agent (NOT Invoke-WebRequest)
$useUrl = if ($thumbUrl) { $thumbUrl } else { $origUrl }
$wc2 = New-Object System.Net.WebClient
$wc2.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
$wc2.DownloadFile($useUrl, "C:\output\filename.jpg")
```

### Key Requirements
1. **TLS 1.2**: Without this, connections silently fail
2. **User-Agent header**: Wikimedia blocks requests without a browser-like User-Agent
3. **WebClient over Invoke-WebRequest**: More reliable for binary downloads
4. **API-derived URLs**: Use the Wikimedia API to get the actual file URL (don't construct URLs manually)
5. **Thumbnail URLs**: For very large files (>10MB), use the `thumburl` with `iiurlwidth=1600` parameter

### Batch Download Template
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$downloads = @(
    @{name="output-name"; title="Wikimedia_File_Title.jpg"},
    @{name="another-file"; title="Another_Wikimedia_Title.jpg"}
)

foreach ($dl in $downloads) {
    $enc = [System.Uri]::EscapeDataString($dl.title)
    $apiUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:$enc&prop=imageinfo&iiprop=url&iiurlwidth=1600&format=json"
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    $json = $wc.DownloadString($apiUrl)
    $data = $json | ConvertFrom-Json
    $pgid = ($data.query.pages.PSObject.Properties | Select-Object -First 1).Name
    $url = $data.query.pages.$pgid.imageinfo[0].thumburl
    if (-not $url) { $url = $data.query.pages.$pgid.imageinfo[0].url }

    $wc2 = New-Object System.Net.WebClient
    $wc2.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    $wc2.DownloadFile($url, "C:\output\$($dl.name).jpg")
    Start-Sleep -Milliseconds 500  # Rate limiting courtesy
}
```

### Verification
Always verify downloaded files aren't error pages:
```powershell
Get-ChildItem *.jpg | Where-Object { $_.Length -lt 10000 } |
    ForEach-Object { Write-Host "SUSPICIOUS (too small): $($_.Name) - $($_.Length) bytes" }
```

---

## 9. Known Issues and Fixes

### Issue: Garbled Characters in Article Body
**Symptom:** Characters like `â€"`, `â€™`, `Ã©` appear on the page.
**Cause:** PowerShell mangles UTF-8 multi-byte characters during HTTP requests.
**Fix:** Replace all non-ASCII characters with HTML entities in the body. See Section 6.

### Issue: HTML Entities Showing Literally in Excerpt
**Symptom:** Excerpt shows `&mdash;` as literal text instead of an em-dash.
**Cause:** Excerpt is rendered as plain text via React `{}`, not as HTML.
**Fix:** Use only ASCII characters in excerpts. Replace dashes with plain hyphens.

### Issue: Upload Rejects File (10MB limit)
**Symptom:** API returns `"File too large. Maximum size is 10MB."`
**Cause:** Original high-resolution images from Wikimedia can exceed 10MB.
**Fix:** Resize locally using System.Drawing before uploading. See Section 2.

### Issue: Wikimedia Download Returns HTML Error Page
**Symptom:** Downloaded file is ~2KB and contains HTML instead of image data.
**Cause:** Missing TLS1.2 setting or User-Agent header.
**Fix:** Set both `[Net.ServicePointManager]::SecurityProtocol = Tls12` AND add Mozilla User-Agent.

### Issue: Downloaded Image is 0 Bytes
**Symptom:** File exists but has 0 bytes.
**Cause:** Connection timeout or rate limiting by Wikimedia.
**Fix:** Add `Start-Sleep` delays between downloads. Use thumbnail URLs instead of full-res. Try fresh PowerShell session.

### Issue: Batch Script Exits Partway Through
**Symptom:** PowerShell batch loop processes some items then exits with code 1.
**Cause:** Unhandled error in one iteration crashes the loop. Common with large file uploads.
**Fix:** Wrap each iteration in `try/catch`. Upload files individually if batch fails.

---

## 10. Complete Workflow Example

Here's the full workflow for adding a new artist with paintings and an article:

### Step 1: Research
- Find artist info on Wikipedia
- Find public domain images on Wikimedia Commons
- Note: `Category:Watercolor_paintings_by_[Artist_Name]` is the best starting point

### Step 2: Download Images Locally
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
# Use the pattern from Section 8
# Always verify file sizes after download
```

### Step 3: Upload Portrait
```powershell
# Upload to subfolder "artists"
# Note the returned URL for artist creation
```

### Step 4: Create Artist
```powershell
# POST /api/v1/artists with name, bio, portrait URL
# Save the returned artist ID for paintings
```

### Step 5: Upload Painting Images
```powershell
# Upload each painting to subfolder "paintings"
# Resize any >10MB images first
# Note all returned URLs
```

### Step 6: Create Paintings
```powershell
# POST /api/v1/paintings for each painting
# Include artistId, title, year, medium, description, images, attribution
```

### Step 7: Write Article
```powershell
# Prepare HTML body:
#   - Use HTML entities for special characters
#   - Embed images using <figure> tags
#   - Include scholarly references
# Prepare plain text excerpt (ASCII only)
# Upload cover image to subfolder "articles"
# POST /api/v1/articles with status="APPROVED"
```

### Step 8: Verify
- Visit the live article page
- Check for encoding issues
- Verify all images load correctly
- Check that the artist page shows linked paintings

---

## 11. API Reference

### Authentication
All endpoints require:
```
Authorization: Bearer wk_<api-key>
```

### Endpoints

#### POST /api/v1/upload
Upload an image file. Returns URL, dimensions, size, format.

#### GET /api/v1/artists
List artists. Params: `limit`, `offset`, `search`.

#### POST /api/v1/artists
Create artist. Required: `name`.

#### GET /api/v1/paintings
List paintings. Params: `limit`, `offset`, `search`, `artistId`.

#### POST /api/v1/paintings
Create painting. Required: `title`, `artistId`.

#### GET /api/v1/articles
List articles. Params: `limit`, `offset`, `search`, `category`, `status`.

#### POST /api/v1/articles
Create article. Required: `title`, `body`.

#### PATCH /api/v1/articles/[id]
Update article. Any field can be updated.

#### DELETE /api/v1/articles/[id]
Delete article permanently.

---

## Published Content Registry

### Turner (Published June 2025)

**Artist:**
- ID: `cmnbpjo4f001fnkxmilprf8ko`
- Slug: `jmw-turner`
- Portrait: `/uploads/artists/turner-artist-portrait_1774785042999.webp`

**Article:**
- ID: `cmnboh8mq0014nkxmuz8hv5pq`
- Slug: `j-m-w-turner-the-master-of-light-and-the-revolution-of-watercolour-painting`
- Cover: `/uploads/articles/turner-portrait_1774783642112.webp`

**Paintings (14 total):**

| Year | Title | Medium | Image URL |
|------|-------|--------|-----------|
| 1802 | Salisbury Cathedral from the Cloisters | Watercolour on paper | `/uploads/paintings/salisbury-cathedral_1774788300195.webp` |
| 1811 | Scarborough Town and Castle | Watercolour on paper | `/uploads/paintings/scarborough-castle_1774788357786.webp` |
| 1819 | Bell Rock Lighthouse | Watercolour on paper | `/uploads/paintings/bell-rock-lighthouse_1774787581880.webp` |
| 1821 | Venice from Fusina | Watercolour on paper | `/uploads/paintings/venice-from-fusina_1774788448420.webp` |
| 1831 | Melrose Abbey | Watercolour on paper | `/uploads/paintings/melrose-abbey_1774788232803.webp` |
| 1835 | Venice from the Porch of Madonna della Salute | Oil on canvas | `/uploads/paintings/venice-san-giorgio_1774792835758.webp` |
| 1839 | The Fighting Temeraire | Oil on canvas | `/uploads/paintings/fighting-temeraire_1774792423112.webp` |
| 1840 | Heidelberg with a Rainbow | Watercolour on paper | `/uploads/paintings/heidelberg-rainbow_1774788228636.webp` |
| 1840 | The Rainbow - Osterspai and Filsen | Watercolour on paper | `/uploads/paintings/rainbow-osterspai_1774788265780.webp` |
| 1841 | Rhine Falls of Schaffhausen | Watercolour on paper | `/uploads/paintings/rhine-falls_1774788269151.webp` |
| 1842 | The Dark Rigi: Lake of Lucerne | Watercolour on paper | `/uploads/paintings/the-dark-rigi_1774788396726.webp` |
| 1842 | The Red Rigi: Lake Lucerne, Sunrise | Watercolour on paper | `/uploads/paintings/the-red-rigi_1774789793619.webp` |
| 1843 | The Pass of St. Gotthard, near Faido | Watercolour on paper | `/uploads/paintings/pass-of-st-gotthard_1774788234518.webp` |
| 1845 | Lucerne from the Lake | Watercolour on paper | `/uploads/paintings/lucerne-from-lake_1774788230733.webp` |
