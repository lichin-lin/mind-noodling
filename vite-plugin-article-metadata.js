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
      
      // Build a map of image imports to their actual built paths
      // Look for patterns like: cover-Cvq5ygLt.png or any asset imports
      const imageAssets = Object.values(bundle).filter(
        chunk => chunk.type === 'asset' && 
        (chunk.fileName.endsWith('.png') || chunk.fileName.endsWith('.jpg'))
      );
      
      // Map original names to built paths (e.g., "cover" -> "/assets/cover-Cvq5ygLt.png")
      const imageMap = {};
      imageAssets.forEach(asset => {
        const match = asset.fileName.match(/\/([^\/]+)-[a-zA-Z0-9_-]+\.(png|jpg)/);
        if (match) {
          const baseName = match[1];
          imageMap[baseName] = `/${asset.fileName}`;
        }
      });
      
      // Extract article metadata from the bundled code
      const articles = [];
      
      // Enhanced pattern to capture metadata with coverImage reference
      // Looking for: {title:"...",slug:"...",description:"...",coverImage:X}
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
          
          // Store the SOURCE path (not the hashed path) so prerender can look it up
          // The prerender script will use manifest.json to find the actual hashed file
          const coverImageSource = `src/assets/${slug}/cover.png`;
          
          articles.push({ 
            title, 
            slug, 
            description,
            coverImageSource // Store source path for manifest lookup
          });
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
