# Quick Reference: Adding New Articles

## Before (Manual) 😫
```
1. Write article.mdx
2. Add to /src/articles/index.js
3. Manually update prerender.js with article metadata  ← Error-prone!
4. Run npm run build
```

## After (Automated) ✨
```
1. Write article.mdx with metadata export
2. Add to /src/articles/index.js
3. Run npm run build  ← That's it!
```

## Example: Adding a New Article

### 1. Create `/src/articles/my-new-article.mdx`

```mdx
export const metadata = {
  title: "My Awesome New Article",
  slug: "my-new-article",
  description: "An amazing article about something cool",
  publishDate: "2025-11-02",
  tags: ["design", "code"],
};

# My Awesome New Article

Your content here...
```

### 2. Update `/src/articles/index.js`

```javascript
import { metadata as simpleflowMeta } from "./simpleflow.mdx";
import { metadata as myNewArticleMeta } from "./my-new-article.mdx";

import SimpleflowArticle from "./simpleflow.mdx";
import MyNewArticle from "./my-new-article.mdx";

export const articles = [
  { ...simpleflowMeta, Component: SimpleflowArticle },
  { ...myNewArticleMeta, Component: MyNewArticle },  // ← Add this line
].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
```

### 3. Build & Deploy

```bash
npm run build
# OR
git push  # Vercel auto-deploys
```

### 4. What Happens Automatically

```
✓ Vite builds your app
✓ Plugin extracts metadata from "my-new-article"
✓ Updates articles-metadata.json
✓ Prerender creates /dist/my-new-article/index.html
✓ Injects proper OG tags for social sharing
```

### 5. Test Your Social Preview

Visit: https://developers.facebook.com/tools/debug/

Enter: `https://mind-noodling.vercel.app/my-new-article`

You'll see:
- ✅ Correct title
- ✅ Correct description  
- ✅ Generated OG image with your article info

## That's It!

No manual metadata maintenance. No hardcoded article lists. Just write and deploy. 🚀
