import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the auto-generated metadata file
const metadataPath = path.join(__dirname, 'dist', 'articles-metadata.json');
const manifestPath = path.join(__dirname, 'dist', '.vite', 'manifest.json');

if (!fs.existsSync(metadataPath)) {
  console.error('❌ articles-metadata.json not found. Build may have failed.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const { articles, baseUrl } = metadata;

// Read Vite's manifest to map original paths to hashed outputs
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

if (articles.length === 0) {
  console.log('⚠️  No articles found to prerender');
  process.exit(0);
}

const template = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8');

// Generate individual HTML files for each article
articles.forEach(article => {
  let html = template;
  
  const title = `${article.title} - Mind noodling`;
  const description = article.description;
  const url = `${baseUrl}/${article.slug}`;
  
  // Look up the actual hashed file path from Vite's manifest
  let image = null;
  if (article.coverImageSource && manifest[article.coverImageSource]) {
    // Use the manifest to get the hashed output path
    image = `${baseUrl}/${manifest[article.coverImageSource].file}`;
  }
  
  // Replace meta tags (handle multiline attributes)
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="og:url" content="${url}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="twitter:url" content="${url}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="twitter:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="og:image" content="${image}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/gs,
    `<meta property="twitter:image" content="${image}" />`
  );
  
  // Replace title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/gs,
    `<meta name="title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gs,
    `<meta name="description" content="${description}" />`
  );
  
  // Create article directory and save
  const articleDir = path.join(__dirname, 'dist', article.slug);
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }
  fs.writeFileSync(path.join(articleDir, 'index.html'), html);
  
  console.log(`✓ Prerendered /${article.slug}`);
});

console.log('\n✨ Prerendering complete!');
