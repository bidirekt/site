import { lexer, walkTokens } from 'marked'
import type { Token } from 'marked'
import { parse } from 'yaml'
import { parseFrontmatter } from '#/frontmatter'
import navSource from '../content/docs/nav.yaml?raw'

export type DocsNode =
  | { label: string; path: string }
  | { label: string; items: Array<{ label: string; path: string }> }

export type DocsEntry = { path: string; label: string; group: string | null }

export type DocsPageContent = {
  path: string
  title: string
  description: string | null
  body: string
  isPlaceholder: boolean
  prev: DocsEntry | null
  next: DocsEntry | null
  group: string | null
  label: string
  editUrl: string
}

type DocsLinkProps =
  { to: '/docs' } | { to: '/docs/$'; params: { _splat: string } }

type NavFields = { label?: unknown; path?: unknown; items?: unknown }

export const SITE_URL = 'https://bidirekt.com'

const OVERVIEW_PATH = 'README.md'
const PLACEHOLDER_BODY = '> Not written yet.'
const EDIT_BASE_URL = 'https://github.com/bidirekt/site/edit/main/content/docs/'
const GLOB_PREFIX = '../content/docs/'

const rawFiles = import.meta.glob('../content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const markdownByPath = new Map(
  Object.entries(rawFiles).map(([key, raw]) => [
    key.slice(GLOB_PREFIX.length),
    raw,
  ]),
)

export const DOCS_TREE: Array<DocsNode> = parseDocsNav(
  navSource,
  new Set(markdownByPath.keys()),
)

export const DOCS_ENTRIES: Array<DocsEntry> = DOCS_TREE.flatMap(entriesOf)

export function docsHref(path: string): string {
  if (path === OVERVIEW_PATH) return '/docs'
  return `/docs/${stripMarkdownExtension(path)}`
}

export function docsLinkProps(path: string): DocsLinkProps {
  if (path === OVERVIEW_PATH) return { to: '/docs' } as const
  return {
    to: '/docs/$',
    params: { _splat: stripMarkdownExtension(path) },
  } as const
}

export function docsPathFromSplat(splat: string | undefined): string | null {
  if (splat === undefined || splat === '' || splat === 'README') return null
  if (splat.endsWith('/')) return null
  return `${splat}.md`
}

export function resolveDocsLink(fromPath: string, href: string): string {
  if (href.startsWith('#') || href.startsWith('http')) return href
  const { target, anchor } = targetAndAnchorFromHref(href)
  return docsHref(resolveRelativePath(fromPath, target)) + anchor
}

export function docsMarkdownHref(path: string): string {
  return `/docs/${path}`
}

export function docsMarkdownUrl(path: string): string {
  return SITE_URL + docsMarkdownHref(path)
}

export function docsMarkdownFromPath(path: string): string | null {
  const page = loadDocsPage(path)
  if (page === null) return null
  const body = markdownWithAbsoluteDocsLinks(path, page.body)
  if (firstTopHeadingText(page.body) !== null) return body
  return `${markdownHeaderFromPage(page)}\n\n${body.trimStart()}`
}

export function llmsTxtFromDocsTree(tree: Array<DocsNode>): string {
  const sections = tree
    .map(llmsTxtSectionFromNode)
    .filter((section) => section !== null)
  return [...llmsTxtHeaderLines(), ...sections].join('\n\n') + '\n'
}

export function loadDocsPage(path: string): DocsPageContent | null {
  const index = DOCS_ENTRIES.findIndex((entry) => entry.path === path)
  if (index === -1) return null
  const raw = markdownByPath.get(path)
  if (raw === undefined) return null
  const entry = DOCS_ENTRIES[index]
  const { meta, body } = parseFrontmatter(raw)
  return {
    path,
    title: meta.title ?? firstTopHeadingText(body) ?? entry.label,
    description: meta.description ?? null,
    body,
    isPlaceholder: body.trim() === PLACEHOLDER_BODY,
    prev: entryAt(index - 1),
    next: entryAt(index + 1),
    group: entry.group,
    label: entry.label,
    editUrl: EDIT_BASE_URL + path,
  }
}

export function parseDocsNav(
  source: string,
  files: Set<string>,
): Array<DocsNode> {
  const nodes: unknown = parse(source)
  if (!Array.isArray(nodes)) throw new Error('nav.yaml: needs a list of nodes')
  const tree = nodes.map((node, index) => navNode(node, `${index + 1}`))
  const paths = new Set(tree.flatMap(entriesOf).map((entry) => entry.path))
  for (const path of paths) {
    if (!files.has(path)) {
      throw new Error(`nav.yaml: "${path}" has no file under content/docs`)
    }
  }
  for (const file of files) {
    if (!paths.has(file)) {
      throw new Error(`content/docs/${file} is not in nav.yaml`)
    }
  }
  return tree
}

function entriesOf(node: DocsNode): Array<DocsEntry> {
  if ('items' in node) {
    return node.items.map((item) => ({
      path: item.path,
      label: item.label,
      group: node.label,
    }))
  }
  return [{ path: node.path, label: node.label, group: null }]
}

function entryAt(index: number): DocsEntry | null {
  if (index < 0 || index >= DOCS_ENTRIES.length) return null
  return DOCS_ENTRIES[index]
}

function stripMarkdownExtension(path: string): string {
  return path.replace(/\.md$/, '')
}

function resolveRelativePath(fromPath: string, relative: string): string {
  const segments = fromPath.split('/').slice(0, -1)
  for (const segment of relative.split('/')) {
    if (segment === '..') {
      segments.pop()
      continue
    }
    if (segment === '.' || segment === '') continue
    segments.push(segment)
  }
  return segments.join('/')
}

function targetAndAnchorFromHref(href: string): {
  target: string
  anchor: string
} {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return { target: href, anchor: '' }
  return { target: href.slice(0, hashIndex), anchor: href.slice(hashIndex) }
}

function markdownHeaderFromPage(page: DocsPageContent): string {
  if (page.description === null) return `# ${page.title}`
  return `# ${page.title}\n\n> ${page.description}`
}

function markdownWithAbsoluteDocsLinks(pagePath: string, body: string): string {
  let rewritten = ''
  let cursor = 0
  for (const token of linkAndCodeTokensFromMarkdown(body)) {
    const start = body.indexOf(token.raw, cursor)
    if (start === -1) continue
    rewritten += body.slice(cursor, start) + sourceFromToken(pagePath, token)
    cursor = start + token.raw.length
  }
  return rewritten + body.slice(cursor)
}

// Code tokens are collected only to move the cursor past them, so text inside
// code that repeats a link is never rewritten.
function linkAndCodeTokensFromMarkdown(body: string): Array<Token> {
  const found: Array<Token> = []
  const insideLink = new Set<Token>()
  walkTokens(lexer(body), (token) => {
    if (insideLink.has(token)) return
    if (token.type === 'link') {
      walkTokens(token.tokens ?? [], (child) => {
        insideLink.add(child)
      })
    }
    if (['link', 'code', 'codespan'].includes(token.type)) found.push(token)
  })
  return found
}

function sourceFromToken(pagePath: string, token: Token): string {
  if (token.type !== 'link') return token.raw
  if (!isRelativeDocsPageHref(token.href)) return token.raw
  const hrefIndex = token.raw.lastIndexOf(token.href)
  if (hrefIndex === -1) return token.raw
  return (
    token.raw.slice(0, hrefIndex) +
    docsMarkdownUrlFromHref(pagePath, token.href) +
    token.raw.slice(hrefIndex + token.href.length)
  )
}

function isRelativeDocsPageHref(href: string): boolean {
  if (href.startsWith('#') || href.startsWith('http')) return false
  return href.endsWith('.md') || href.includes('.md#')
}

function docsMarkdownUrlFromHref(pagePath: string, href: string): string {
  const { target, anchor } = targetAndAnchorFromHref(href)
  return docsMarkdownUrl(resolveRelativePath(pagePath, target)) + anchor
}

function firstTopHeadingText(body: string): string | null {
  for (const token of lexer(body)) {
    if (token.type === 'heading' && token.depth === 1) return token.text
  }
  return null
}

function llmsTxtHeaderLines(): Array<string> {
  const overview = loadDocsPage(OVERVIEW_PATH)
  if (overview === null) return []
  const summary = firstParagraphAfterTitle(overview.body)
  if (summary === null) return [`# ${overview.title}`]
  return [`# ${overview.title}`, `> ${summary}`]
}

function firstParagraphAfterTitle(body: string): string | null {
  const tokens = lexer(body)
  const titleIndex = tokens.findIndex(
    (token) => token.type === 'heading' && token.depth === 1,
  )
  for (const token of tokens.slice(titleIndex + 1)) {
    if (token.type === 'paragraph') return token.text
  }
  return null
}

function llmsTxtSectionFromNode(node: DocsNode): string | null {
  const items = entriesOf(node)
    .map(llmsTxtItemFromEntry)
    .filter((item) => item !== null)
  if (items.length === 0) return null
  return `## ${node.label}\n\n${items.join('\n')}`
}

function llmsTxtItemFromEntry(entry: DocsEntry): string | null {
  const page = loadDocsPage(entry.path)
  if (page === null || page.isPlaceholder) return null
  const item = `- [${entry.label}](${docsMarkdownUrl(entry.path)})`
  if (page.description === null) return item
  return `${item}: ${page.description}`
}

function navNode(value: unknown, id: string): DocsNode {
  const { label, path, items } = navFields(value)
  if (typeof label !== 'string') {
    throw new Error(`nav.yaml: node ${id} needs "label"`)
  }
  if (typeof path === 'string') return { label, path }
  if (!Array.isArray(items)) {
    throw new Error(`nav.yaml: node ${id} needs "path" or "items"`)
  }
  if (items.length === 0) throw new Error(`nav.yaml: node ${id} has no items`)
  return {
    label,
    items: items.map((item, index) => navLeaf(item, `${id}.${index + 1}`)),
  }
}

function navLeaf(value: unknown, id: string): { label: string; path: string } {
  const { label, path } = navFields(value)
  if (typeof label !== 'string') {
    throw new Error(`nav.yaml: node ${id} needs "label"`)
  }
  if (typeof path !== 'string') {
    throw new Error(`nav.yaml: node ${id} needs "path"`)
  }
  return { label, path }
}

function navFields(value: unknown): NavFields {
  if (typeof value !== 'object' || value === null) return {}
  return value
}
