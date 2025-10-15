import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { remarkSandpack } from "remark-sandpack";
import rehypePrism from "rehype-prism-plus";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { 
      enforce: "pre", 
      ...mdx({ 
        remarkPlugins: [remarkGfm, remarkSandpack],
        rehypePlugins: [rehypePrism]
      }) 
    },
    react(),
    tailwindcss(),
  ],
  base: "/",
});
