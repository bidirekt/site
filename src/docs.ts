import { lexer } from 'marked'
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
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return docsHref(resolveRelativePath(fromPath, href))
  const target = href.slice(0, hashIndex)
  const hash = href.slice(hashIndex)
  return docsHref(resolveRelativePath(fromPath, target)) + hash
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

function firstTopHeadingText(body: string): string | null {
  for (const token of lexer(body)) {
    if (token.type === 'heading' && token.depth === 1) return token.text
  }
  return null
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
