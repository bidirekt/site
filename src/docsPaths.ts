import { SITE_URL } from '#/site'

export const OVERVIEW_PATH = 'README.md'

export function docsHref(path: string): string {
  if (path === OVERVIEW_PATH) return '/docs/'
  return `/docs/${stripMarkdownExtension(path)}/`
}

export function docsMarkdownHref(path: string): string {
  return `/docs/${path}`
}

export function docsMarkdownUrl(path: string): string {
  return SITE_URL + docsMarkdownHref(path)
}

export function stripMarkdownExtension(path: string): string {
  return path.replace(/\.md$/, '')
}
