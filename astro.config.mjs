import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cleanaircouncil.github.io',
  base: 'pollutiontracker',
  build: {
    inlineStylesheets: 'never'
  }
});