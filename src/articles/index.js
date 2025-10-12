// Import all article metadata
import { metadata as pulseEffectMeta } from './pulse-effect.mdx';
import { metadata as simpleflowMeta } from './simpleflow.mdx';
import { metadata as curveTextMeta } from './curve-text.mdx';
import { metadata as loopsMeta } from './loops.mdx';

// Import article components
import PulseEffectArticle from './pulse-effect.mdx';
import SimpleflowArticle from './simpleflow.mdx';
import CurveTextArticle from './curve-text.mdx';
import LoopsArticle from './loops.mdx';

export const articles = [
  {
    ...pulseEffectMeta,
    Component: PulseEffectArticle
  },
  {
    ...simpleflowMeta,
    Component: SimpleflowArticle
  },
  {
    ...curveTextMeta,
    Component: CurveTextArticle
  },
  {
    ...loopsMeta,
    Component: LoopsArticle
  }
].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)); // Sort by date, newest first

export { PulseEffectArticle, SimpleflowArticle, CurveTextArticle, LoopsArticle };
