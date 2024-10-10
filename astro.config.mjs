import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://mariopb05.github.io',
  base: 'dwec-learning-js',
  integrations: [tailwind(), icon()]
});