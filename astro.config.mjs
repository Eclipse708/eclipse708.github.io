import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  // Change `site` to your final URL.
  // For a user/org page (eclipse708.github.io), keep site as-is and leave base unset.
  // For a project page (eclipse708.github.io/repo-name), uncomment `base` and set it.
  site: 'https://eclipse708.github.io',
  // base: '/repo-name',

  markdown: {
    // Astro 6.4+ moved remark/rehype plugins onto a `unified()` processor.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      // 'css-variables' lets us style code via CSS — see styles/global.css
      theme: 'css-variables',
      wrap: false,
    },
  },
});
