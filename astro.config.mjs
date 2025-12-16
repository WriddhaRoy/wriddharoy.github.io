// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourusername.github.io',
  // Remove base for local dev, or use environment variable
  base: process.env.NODE_ENV === 'production' ? '/wriddharoy.com' : '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
