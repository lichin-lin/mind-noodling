/**
 * Vite plugin to generate article metadata JSON during build
 * This allows the prerender script to be fully automated
 */
export function articleMetadataPlugin() {
  return {
    name: 'article-metadata-generator',
    
    // Run after build is complete but before files are written
    generateBundle(options, bundle) {
      // Find the main JS chunk that contains article metadata
      const jsChunks = Object.values(bundle).filter(
        chunk => chunk.type === 'chunk' && chunk.fileName.startsWith('assets/index-')
      );
      
      if (jsChunks.length === 0) return;
      
      const mainChunk = jsChunks[0];
      const code = mainChunk.code;
      
      // Extract article metadata from the bundled code
      // Look for the metadata objects in the bundle
      const articles = [];
      
      // Pattern to match metadata exports: title, slug, description, coverImage
      const metadataPattern = /{[^}]*title:\s*["']([^"']+)["'][^}]*slug:\s*["']([^"']+)["'][^}]*description:\s*["']([^"']+)["'][^}]*}/gs;
      
      let match;
      const seen = new Set();
      
      while ((match = metadataPattern.exec(code)) !== null) {
        const title = match[1];
        const slug = match[2];
        const description = match[3];
        
        // Avoid duplicates
        if (!seen.has(slug)) {
          seen.add(slug);
          articles.push({ title, slug, description });
        }
      }
      
      // Generate metadata JSON file
      const metadata = {
        articles,
        generatedAt: new Date().toISOString(),
        baseUrl: 'https://mind-noodling.vercel.app'
      };
      
      // Emit the metadata file to the dist folder
      this.emitFile({
        type: 'asset',
        fileName: 'articles-metadata.json',
        source: JSON.stringify(metadata, null, 2)
      });
      
      console.log(`\n📝 Generated metadata for ${articles.length} article(s)`);
    }
  };
}
