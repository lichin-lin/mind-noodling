import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { remarkSandpack } from "remark-sandpack";
import rehypeMdxCodeProps from 'rehype-mdx-code-props';
import { articleMetadataPlugin } from './vite-plugin-article-metadata.js';

import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { 
      ...mdx({ 
        remarkPlugins: [remarkGfm, remarkSandpack],
        rehypePlugins: [rehypeMdxCodeProps],
      }) 
    },
    react(),
    tailwindcss(),
    articleMetadataPlugin(),
  ],
  base: "/",
  build: {
    manifest: true, // Generate manifest.json to map source to hashed outputs
  },
});
