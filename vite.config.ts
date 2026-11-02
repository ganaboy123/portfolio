import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { absoluteUrl, siteConfig } from './site.config.mjs'

const socialImage = absoluteUrl(siteConfig.socialImage)
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteConfig.siteUrl}/#person`,
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      knowsAbout: siteConfig.areasOfExpertise,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.siteUrl}/#website`,
      url: siteConfig.siteUrl,
      name: `${siteConfig.name} Portfolio`,
      description: siteConfig.description,
      inLanguage: 'en',
      author: { '@id': `${siteConfig.siteUrl}/#person` },
    },
  ],
}).replace(/</g, '\\u003c')

const seoHead = `
  <meta name="description" content="${siteConfig.description}" />
  <meta name="robots" content="index,follow" />
  <meta name="theme-color" content="${siteConfig.themeColor}" />
  <link rel="canonical" href="${siteConfig.siteUrl}/" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${siteConfig.name} Portfolio" />
  <meta property="og:locale" content="${siteConfig.locale}" />
  <meta property="og:title" content="${siteConfig.title}" />
  <meta property="og:description" content="${siteConfig.description}" />
  <meta property="og:url" content="${siteConfig.siteUrl}/" />
  <meta property="og:image" content="${socialImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${siteConfig.name}, computer scientist and software engineer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${siteConfig.title}" />
  <meta name="twitter:description" content="${siteConfig.description}" />
  <meta name="twitter:image" content="${socialImage}" />
  <meta name="twitter:image:alt" content="${siteConfig.name}, computer scientist and software engineer" />
  <script type="application/ld+json">${structuredData}</script>`

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-seo',
      transformIndexHtml(html) {
        return html
          .replace('<!-- seo:metadata -->', seoHead)
          .replace('<title>Portfolio</title>', `<title>${siteConfig.title}</title>`)
      },
    },
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js core — largest dependency, isolated
          if (id.includes('node_modules/three')) return 'three'
          // React Three Fiber + Drei
          if (id.includes('@react-three')) return 'r3f'
          // GSAP animation
          if (id.includes('node_modules/gsap')) return 'gsap'
          // Zustand state
          if (id.includes('node_modules/zustand')) return 'vendor'
          // React + ReactDOM
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
