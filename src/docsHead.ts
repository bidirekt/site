import type { DocsPageContent } from '#/docs'
import { OVERVIEW_PATH, docsHref, docsMarkdownUrl } from '#/docsPaths'
import { pageHead } from '#/site'

export function docsPageHead(page: DocsPageContent | undefined) {
  if (page === undefined) return {}
  const head = pageHead(
    docsHref(page.path),
    docsPageTitle(page),
    page.description,
  )
  head.links.push({
    rel: 'alternate',
    type: 'text/markdown',
    href: docsMarkdownUrl(page.path),
  })
  return head
}

function docsPageTitle(page: DocsPageContent): string {
  if (page.path === OVERVIEW_PATH) return 'Documentation · Bidirekt'
  return `${page.title} · Bidirekt docs`
}
