import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { absoluteUrl, siteConfig } from '../site.config.mjs'

const publicDir = resolve(import.meta.dirname, '../public')
await mkdir(publicDir, { recursive: true })

await writeFile(resolve(publicDir, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`)

await writeFile(resolve(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`)
