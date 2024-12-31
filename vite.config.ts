import optimizeLocales from '@react-aria/optimize-locales-plugin';
import { reactRouter } from '@react-router/dev/vite';
import autoprefixer from 'autoprefixer';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    {
      ...optimizeLocales.vite({
        locales: ['en-US', 'fr-FR'],
      }),
      enforce: 'pre',
    },
    reactRouterHonoServer({
      runtime: 'bun',
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
