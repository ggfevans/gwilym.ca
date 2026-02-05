// @ts-check
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";

const shikiTheme = JSON.parse(
  readFileSync(
    new URL("./src/styles/shiki-gwilym.json", import.meta.url),
    "utf-8",
  ),
);

// https://astro.build/config
export default defineConfig({
  site: "https://gwilym.ca",
  markdown: {
    shikiConfig: {
      theme: shikiTheme,
    },
    rehypePlugins: [rehypeSlug],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ["/pagefind/pagefind-ui.js"],
      },
    },
  },

  integrations: [svelte(), react(), sitemap()],
});
