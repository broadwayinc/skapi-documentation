import { defineConfig } from 'vitepress'
import all_files from '../all_files.mjs';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',

  title: "Skapi",
  description: "Serverless Backend API for HTML frontend",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-sml.png',

    sidebar: [
      ...all_files
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/broadwayinc/skapi-js' }
    ]
  },
  vite: {
    server: {
      allowedHosts: ['seoul.broadwayinc.computer', 'us.broadwayinc.computer'],
    }
  }
})
