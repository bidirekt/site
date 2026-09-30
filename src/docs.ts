import { lexer } from 'marked'
import { parseFrontmatter } from '#/frontmatter'

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

const OVERVIEW_PATH = 'README.md'
const PLACEHOLDER_BODY = '> Not written yet.'
const EDIT_BASE_URL = 'https://github.com/bidirekt/docs/edit/main/'
const GLOB_PREFIX = '../content/docs/'

export const DOCS_TREE: Array<DocsNode> = [
  { label: 'Overview', path: OVERVIEW_PATH },
  {
    label: 'Concepts',
    items: [
      { label: 'Contract testing', path: 'concepts/contract-testing.md' },
      {
        label: 'How the broker works',
        path: 'concepts/how-the-broker-works.md',
      },
      { label: 'The direction rule', path: 'concepts/direction-rule.md' },
    ],
  },
  {
    label: 'Contracts',
    items: [{ label: 'Specification', path: 'contracts/spec.md' }],
  },
  {
    label: 'Reference',
    items: [{ label: 'CLI reference', path: 'reference/cli.md' }],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Installation', path: 'guides/installation.md' },
      { label: 'Getting started', path: 'guides/getting-started.md' },
      { label: 'CI integration', path: 'guides/ci-integration.md' },
    ],
  },
]

export const DOCS_ENTRIES: Array<DocsEntry> = DOCS_TREE.flatMap(entriesOf)

const rawFiles = import.meta.glob('../content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const files = new Map(
  Object.entries(rawFiles).map(([key, raw]) => [
    key.slice(GLOB_PREFIX.length),
    raw,
  ]),
)

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
  const raw = files.get(path)
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
