import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { SITE_URL, canonicalUrl, isSiteLaunched } from '../src/site.ts'

const CLIENT_DIR = 'dist/client'
const PAGE_FILE = 'index.html'
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`
const TITLE = /<title>([^<]*)<\/title>/

assertTitlesUnique(pageFiles())
writeFileSync(`${CLIENT_DIR}/robots.txt`, robotsTxt())
writeFileSync(`${CLIENT_DIR}/sitemap.xml`, sitemapXml(pageUrls()))

function robotsTxt(): string {
  const allowAll = 'User-agent: *\nAllow: /\n'
  if (!isSiteLaunched(process.env)) return allowAll
  return `${allowAll}\nSitemap: ${SITEMAP_URL}\n`
}

function pageFiles(): Array<string> {
  return readdirSync(CLIENT_DIR, { recursive: true, encoding: 'utf8' }).filter(
    (file) => file === PAGE_FILE || file.endsWith(`/${PAGE_FILE}`),
  )
}

function pageUrls(): Array<string> {
  return pageFiles()
    .map((file) => canonicalUrl(pagePath(file)))
    .sort()
}

function pagePath(file: string): string {
  return `/${file.slice(0, -PAGE_FILE.length)}`
}

function assertTitlesUnique(files: Array<string>): void {
  const pathByTitle = new Map<string, string>()
  for (const file of files) {
    const title = pageTitle(file)
    const path = pagePath(file)
    const other = pathByTitle.get(title)
    if (other !== undefined) {
      throw new Error(`Title "${title}" is shared by ${other} and ${path}`)
    }
    pathByTitle.set(title, path)
  }
}

function pageTitle(file: string): string {
  const html = readFileSync(`${CLIENT_DIR}/${file}`, 'utf8')
  const title = TITLE.exec(html)?.[1]
  if (title === undefined) throw new Error(`${pagePath(file)} has no <title>`)
  return title
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
