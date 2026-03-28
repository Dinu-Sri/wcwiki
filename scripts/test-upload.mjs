import fs from 'fs';
import path from 'path';

const API = 'http://109.199.125.98:3001/api/v1';
const KEY = 'wk_0a4e2905b0baf320278acd36a8b9f35e2f0493aa';

const headers = { 'Authorization': `Bearer ${KEY}` };
const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

// Helper: upload a local file
async function uploadFile(filePath, subfolder = 'general', alt = '') {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

  const form = new FormData();
  form.append('file', blob, fileName);
  form.append('subfolder', subfolder);
  if (alt) form.append('alt', alt);

  const res = await fetch(`${API}/upload`, { method: 'POST', headers, body: form });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  UPLOAD FAILED (${res.status}):`, data.error);
    return null;
  }
  console.log(`  Uploaded: ${fileName} -> ${data.data.url} (${data.data.width}x${data.data.height})`);
  return data.data;
}

// Helper: PATCH a resource
async function patch(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  PATCH FAILED (${res.status}):`, data.error);
    return null;
  }
  return data.data;
}

// Helper: GET a resource
async function get(endpoint) {
  const res = await fetch(`${API}${endpoint}`, { headers });
  return (await res.json()).data;
}

async function main() {
  const imgDir = path.resolve('temp_images');

  // === Step 1: Upload images for paintings ===
  console.log('\n=== UPLOADING IMAGES FOR PAINTINGS ===');

  const paintingImages = [
    { file: 'watercolor-landscape.jpg', alt: 'Watercolor Landscape Painting' },
    { file: 'watercolor-flowers.jpg', alt: 'Watercolor Flowers' },
    { file: 'watercolor-abstract.jpg', alt: 'Abstract Watercolor' },
  ];

  const paintingUrls = [];
  for (const img of paintingImages) {
    const result = await uploadFile(path.join(imgDir, img.file), 'paintings', img.alt);
    if (result) paintingUrls.push(result.url);
  }

  // === Step 2: Upload images for articles ===
  console.log('\n=== UPLOADING IMAGES FOR ARTICLES ===');

  const articleImages = [
    { file: 'watercolor-brushes.jpg', alt: 'Watercolor Brushes Guide' },
    { file: 'watercolor-palette.jpg', alt: 'Watercolor Palette Setup' },
    { file: 'watercolor-supplies.jpg', alt: 'Watercolor Supplies' },
  ];

  const articleUrls = [];
  for (const img of articleImages) {
    const result = await uploadFile(path.join(imgDir, img.file), 'articles', img.alt);
    if (result) articleUrls.push(result.url);
  }

  // === Step 3: Attach images to paintings ===
  console.log('\n=== ATTACHING IMAGES TO PAINTINGS ===');

  // Get first 3 paintings
  const paintingsRes = await fetch(`${API}/paintings?limit=3`, { headers });
  const paintings = (await paintingsRes.json()).data;

  for (let i = 0; i < Math.min(paintings.length, paintingUrls.length); i++) {
    const p = paintings[i];
    const url = paintingUrls[i];
    const existing = p.images || [];
    const updated = await patch(`/paintings/${p.id}`, { images: [...existing, url] });
    if (updated) {
      console.log(`  ${p.title}: added image -> ${url}`);
    }
  }

  // === Step 4: Attach coverImage + body images to articles ===
  console.log('\n=== ATTACHING IMAGES TO ARTICLES ===');

  const articlesRes = await fetch(`${API}/articles?limit=3`, { headers });
  const articles = (await articlesRes.json()).data;

  for (let i = 0; i < Math.min(articles.length, articleUrls.length); i++) {
    const a = articles[i];
    const url = articleUrls[i];

    // Set as coverImage
    const updated = await patch(`/articles/${a.id}`, { coverImage: url });
    if (updated) {
      console.log(`  ${a.title}: set coverImage -> ${url}`);
    }

    // Also insert an <img> tag into the article body to test inline images
    if (a.body) {
      const imgTag = `<figure><img src="${url}" alt="${a.title} illustration" style="max-width:100%;border-radius:8px;margin:1em 0;" /><figcaption style="text-align:center;font-size:0.85em;color:#888;">Illustration for ${a.title}</figcaption></figure>`;
      const newBody = imgTag + '\n' + a.body;
      const bodyUpdated = await patch(`/articles/${a.id}`, { body: newBody });
      if (bodyUpdated) {
        console.log(`  ${a.title}: inserted inline <img> into body`);
      }
    }
  }

  // === Step 5: Verify ===
  console.log('\n=== VERIFICATION ===');

  // List uploaded media
  const mediaRes = await fetch(`${API}/upload?limit=10`, { headers });
  const media = await mediaRes.json();
  console.log(`  Total media uploaded: ${media.total}`);
  for (const m of media.data) {
    console.log(`    ${m.subfolder}/${m.filename} -> ${m.url}`);
  }

  // Check a painting
  if (paintings.length > 0) {
    const p = await get(`/paintings/${paintings[0].id}`);
    console.log(`\n  Painting "${p.title}" images:`, p.images);
  }

  // Check an article
  if (articles.length > 0) {
    const a = await get(`/articles/${articles[0].id}`);
    console.log(`\n  Article "${a.title}" coverImage: ${a.coverImage}`);
    console.log(`  Body starts with <figure>: ${a.body?.startsWith('<figure>')}`);
  }

  console.log('\n=== DONE ===');
}

main().catch(console.error);
