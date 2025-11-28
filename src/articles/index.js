// Import all article metadata
import { metadata as simpleflowMeta } from './simpleflow.mdx'

// Import article components
import SimpleflowArticle from './simpleflow.mdx'

export const articles = [
  {
    ...simpleflowMeta,
    Component: SimpleflowArticle,
  },
].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)) // Sort by date, newest first

export { SimpleflowArticle }
