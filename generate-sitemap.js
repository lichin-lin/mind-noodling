import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the auto-generated metadata file
const metadataPath = path.join(__dirname, 'dist', 'articles-metadata.json');

if (!fs.existsSync(metadataPath)) {
  console.error('❌ articles-metadata.json not found. Build may have failed.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const { articles, baseUrl } = metadata;

const today = new Date().toISOString().split('T')[0];

// Generate sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${articles.map(article => `  <url>
    <loc>${baseUrl}/${article.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'dist', 'sitemap.xml'), sitemap);
console.log(`✓ Generated sitemap.xml with ${articles.length + 1} URLs`);
