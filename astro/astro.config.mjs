// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  integrations: [
    sitemap({
      customPages: ["aaa"],
    }),
  ],
  output: "static",
  site: "https://example.com",
  trailingSlash: "never",
});
