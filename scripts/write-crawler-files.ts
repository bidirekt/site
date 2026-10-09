import { readdirSync, writeFileSync } from 'node:fs'
import { SITE_URL, canonicalUrl, isSiteLaunched } from '../src/site.ts'

const CLIENT_DIR = 'dist/client'
const PAGE_FILE = 'index.html'
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

writeFileSync(`${CLIENT_DIR}/robots.txt`, robotsTxt())
writeFileSync(`${CLIENT_DIR}/sitemap.xml`, sitemapXml(pageUrls()))

function robotsTxt(): string {
  const allowAll = 'User-agent: *\nAllow: /\n'
  if (!isSiteLaunched(process.env)) return allowAll
  return `${allowAll}\nSitemap: ${SITEMAP_URL}\n`
}

function pageUrls(): Array<string> {
  return readdirSync(CLIENT_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => file === PAGE_FILE || file.endsWith(`/${PAGE_FILE}`))
    .map((file) => canonicalUrl(`/${file.slice(0, -PAGE_FILE.length)}`))
    .sort()
}

function sitemapXml(urls: Array<string>): string {
  const entries = urls.map((url) => `  <url><loc>${url}</loc></url>\n`)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
    ...entries,
    '</urlset>\n',
  ].join('')
}
