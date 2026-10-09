type PagefindSection = {
  title: string
  url: string
  anchor?: { id: string }
  locations: Array<number>
}

type PagefindPage = {
  url: string
  excerpt: string
  meta: { title: string }
  sub_results: Array<PagefindSection>
}

type PagefindSearch = {
  results: Array<{ data: () => Promise<PagefindPage> }>
}

type Pagefind = {
  debouncedSearch: (term: string) => Promise<PagefindSearch | null>
}

type SearchSection = { href: string; title: string }

export type SearchHit = {
  href: string
  title: string
  excerpt: string
  sections: Array<SearchSection>
}

const PAGEFIND_URL = '/pagefind/pagefind.js'
const MAX_HITS = 8
const MAX_SECTIONS = 3

let pagefindLoad: Promise<Pagefind> | null = null

export async function searchDocs(
  term: string,
): Promise<Array<SearchHit> | null> {
  const pagefind = await loadPagefind()
  const search = await pagefind.debouncedSearch(term)
  if (search === null) return null
  const pages = await Promise.all(
    search.results.slice(0, MAX_HITS).map((result) => result.data()),
  )
  return pages.map(searchHitFromPage)
}

// One shared promise keeps debouncedSearch calls in typing order: separate
// import() calls made while pagefind.js loads resolve in any order, and Pagefind
// then answers the newest term with null, as if an older one superseded it.
function loadPagefind(): Promise<Pagefind> {
  pagefindLoad ??= import(/* @vite-ignore */ PAGEFIND_URL)
  return pagefindLoad
}

function searchHitFromPage(page: PagefindPage): SearchHit {
  return {
    href: siteHrefFromPagefindUrl(page.url),
    title: page.meta.title,
    excerpt: page.excerpt,
    sections: topSections(page.sub_results).map((section) => ({
      href: siteHrefFromPagefindUrl(section.url),
      title: section.title,
    })),
  }
}

function topSections(sections: Array<PagefindSection>): Array<PagefindSection> {
  const anchored = sections.filter((section) => section.anchor !== undefined)
  const top = new Set([...anchored].sort(byMatchCount).slice(0, MAX_SECTIONS))
  return anchored.filter((section) => top.has(section))
}

function byMatchCount(a: PagefindSection, b: PagefindSection): number {
  return b.locations.length - a.locations.length
}

function siteHrefFromPagefindUrl(url: string): string {
  return url.replace(/\/(?=#|$)/, '')
}
