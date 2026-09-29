import { Marked } from 'marked'
import type { Tokens } from 'marked'
import { button } from '#/Components/Button'
import { pane } from '#/Components/Pane'
import { resolveDocsLink } from '#/docs'

export type TocEntry = { id: string; text: string; level: 2 | 3 }
export type YamlTone = 'key' | 'colon' | 'value' | 'plain'
export type ShellTone = 'prompt' | 'command' | 'output'
export type Segment<TTone extends string> = { text: string; tone: TTone }

type RenderOptions = { pagePath: string; title: string }
type RenderResult = { html: string; toc: Array<TocEntry> }
type CodeLine = { classes: string; inner: string }

const HEADING_BASE = 'leading-[1.25] font-medium text-primary scroll-mt-[72px]'
const HEADING_BY_DEPTH: Partial<Record<number, string>> = {
  1: 'mb-4 text-[40px] tracking-[-0.01em]',
  2: 'mt-12 mb-4 text-[24px]',
  3: 'mt-8 mb-3 text-[18px]',
}
const HEADING_DEEPER = 'mt-8 mb-3 text-[14px]'
const PARAGRAPH = 'mb-4 text-[14px] leading-[1.7] text-secondary text-pretty'
const CODESPAN =
  'rounded-[2px] border border-line bg-hover px-[5px] py-px text-[0.92em] [overflow-wrap:anywhere] text-primary'
const STRONG = 'font-semibold text-primary'
const EM = 'italic text-secondary'
const LINK = 'text-accent hover:text-primary border-b border-accent/33'
const PRE =
  'px-4 py-3 text-[13px] leading-[1.45] whitespace-pre-wrap [overflow-wrap:anywhere] text-primary'
const CODE_LINE = 'block min-h-[1.45em]'
const PROMPT_LINE = 'pl-[2ch] -indent-[2ch] text-muted'
const OUTPUT_LINE = 'text-primary'
const NOTE_LABEL = 'text-[12px] uppercase tracking-[0.08em] text-muted mb-2'
const NOTE_CONTENT =
  'text-[14px] leading-[1.7] text-primary [&_p]:text-primary [&_p:last-child]:mb-0'
const TABLE = 'w-full text-[13px] leading-[1.45]'
const TABLE_ROW = '[&:last-child>td]:border-b-0'
const TABLE_HEADER_CELL =
  'px-3 py-2 text-left text-[12px] uppercase tracking-[0.08em] font-normal text-muted whitespace-nowrap border-b border-line'
const TABLE_CELL =
  'px-3 py-2 align-top text-[13px] text-primary border-b border-line'
const LIST = 'mb-4 list-none'
const LIST_ITEM =
  'grid grid-cols-[max-content_1fr] gap-3 mb-1 text-[14px] leading-[1.7]'
const LIST_PREFIX = 'text-muted select-none'
const LIST_TEXT = 'min-w-0 text-secondary'
const RULE = 'my-6 overflow-hidden whitespace-nowrap text-line'

const YAML_TONE_CLASS: Record<YamlTone, string | null> = {
  key: 'text-secondary',
  colon: 'text-muted',
  value: 'text-primary',
  plain: null,
}
const SHELL_TONE_CLASS: Record<ShellTone, string | null> = {
  prompt: 'text-accent',
  command: null,
  output: null,
}
const SHELL_LANGS = new Set(['', 'sh', 'shell', 'bash', 'console', 'text'])
const YAML_KEY_LINE = /^(\s*)(-\s+)?("?[^:"]+"?)(:)(.*)$/
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function renderDocsMarkdown(
  body: string,
  options: RenderOptions,
): RenderResult {
  const toc: Array<TocEntry> = []
  const slugCounts = new Map<string, number>()
  let titleOmitted = false

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        if (depth === 1 && !titleOmitted && text === options.title) {
          titleOmitted = true
          return ''
        }
        const id = uniqueSlug(slugCounts, slug(text))
        const level = tocLevel(depth)
        if (level !== null) toc.push({ id, text: stripBackticks(text), level })
        const classes = HEADING_BY_DEPTH[depth] ?? HEADING_DEEPER
        return `<h${depth} id="${id}" class="${HEADING_BASE} ${classes}">${this.parser.parseInline(tokens)}</h${depth}>`
      },
      paragraph({ tokens }) {
        return `<p class="${PARAGRAPH}">${this.parser.parseInline(tokens)}</p>`
      },
      code({ text, lang = '' }) {
        return renderCodePane(text, lang)
      },
      codespan({ text }) {
        return `<code class="${CODESPAN}">${escapeHtml(text)}</code>`
      },
      strong({ tokens }) {
        return `<strong class="${STRONG}">${this.parser.parseInline(tokens)}</strong>`
      },
      em({ tokens }) {
        return `<em class="${EM}">${this.parser.parseInline(tokens)}</em>`
      },
      link({ href, tokens }) {
        const label = this.parser.parseInline(tokens)
        if (href.startsWith('http')) {
          return `<a href="${escapeHtml(href)}" class="${LINK}" target="_blank" rel="noreferrer">${label} ↗</a>`
        }
        const resolved = resolveDocsHref(options.pagePath, href)
        return `<a href="${escapeHtml(resolved)}" class="${LINK}">${label}</a>`
      },
      blockquote({ tokens }) {
        const root = pane().root({
          className: 'my-4 border-l-2 border-l-accent',
        })
        return `<blockquote class="${root}"><div class="px-4 py-3"><div class="${NOTE_LABEL}">&gt; note</div><div class="${NOTE_CONTENT}">${this.parser.parse(tokens)}</div></div></blockquote>`
      },
      table(token) {
        const root = pane().root({ className: 'my-4 overflow-x-auto' })
        const header = this.tablerow({
          text: token.header.map((cell) => this.tablecell(cell)).join(''),
        })
        const rows = token.rows
          .map((row) =>
            this.tablerow({
              text: row.map((cell) => this.tablecell(cell)).join(''),
            }),
          )
          .join('')
        return `<div class="${root}"><table class="${TABLE}"><thead>${header}</thead><tbody>${rows}</tbody></table></div>`
      },
      tablerow({ text }) {
        return `<tr class="${TABLE_ROW}">${text}</tr>`
      },
      tablecell(token) {
        const content = this.parser.parseInline(token.tokens)
        if (token.header) {
          return `<th class="${TABLE_HEADER_CELL}">${content}</th>`
        }
        return `<td class="${TABLE_CELL}">${content}</td>`
      },
      list(token) {
        const tag = listTag(token.ordered)
        const items = token.items
          .map(
            (item, index) =>
              `<li class="${LIST_ITEM}"><span class="${LIST_PREFIX}">${listPrefix(token, index)}</span>${this.listitem(item)}</li>`,
          )
          .join('')
        return `<${tag} class="${LIST}">${items}</${tag}>`
      },
      listitem(item) {
        return `<div class="${LIST_TEXT}">${this.parser.parse(item.tokens)}</div>`
      },
      hr() {
        return `<div class="${RULE}">${'─'.repeat(120)}</div>`
      },
    },
  })

  const html = marked.parse(body, { async: false })
  return { html, toc }
}

export function yamlLine(line: string): Array<Segment<YamlTone>> {
  const match = YAML_KEY_LINE.exec(line)
  if (match === null) return nonEmpty([{ text: line, tone: 'plain' }])
  const [, indent, dash = '', key, colon, value] = match
  return nonEmpty([
    { text: indent + dash, tone: 'plain' },
    { text: key, tone: 'key' },
    { text: colon, tone: 'colon' },
    { text: value, tone: 'value' },
  ])
}

export function shellLine(line: string): Array<Segment<ShellTone>> {
  if (!line.startsWith('$ ')) return [{ text: line, tone: 'output' }]
  return [
    { text: '$ ', tone: 'prompt' },
    { text: line.slice(2), tone: 'command' },
  ]
}

function renderCodePane(code: string, lang: string): string {
  const slots = pane()
  const lines = code.split('\n')
  const shell = SHELL_LANGS.has(lang)
  const title = codeTitle(lang, shell, lines[0])
  const copy = `<button type="button" data-copy class="${button({ variant: 'ghost' })}">[ copy ]</button>`
  const header = `<header class="${slots.titleBar()}"><span class="${slots.title()}">── ${escapeHtml(title)}</span><span class="${slots.titleRight()}">${copy}</span></header>`
  return `<section data-code class="${slots.root({ className: 'my-4' })}">${header}<pre class="${PRE}">${renderCodeLines(lines, lang, shell)}</pre></section>`
}

function codeTitle(lang: string, shell: boolean, firstLine: string): string {
  if (lang !== '') return lang
  if (shell && firstLine.startsWith('$ ')) return 'shell'
  return 'text'
}

// The newline lives inside each block span: between block boxes a preserved
// newline would lay out as an extra empty line.
function renderCodeLines(
  lines: Array<string>,
  lang: string,
  shell: boolean,
): string {
  const last = lines.length - 1
  return lines
    .map((line, index) => {
      const { classes, inner } = codeLine(line, lang, shell)
      const lineClasses = [CODE_LINE, classes].join(' ').trim()
      return `<span class="${lineClasses}">${inner}${newlineUnlessLast(index, last)}</span>`
    })
    .join('')
}

function codeLine(line: string, lang: string, shell: boolean): CodeLine {
  if (lang === 'yaml') {
    const inner = yamlLine(line)
      .map((segment) => toneHtml(segment, YAML_TONE_CLASS))
      .join('')
    return { classes: '', inner }
  }
  if (shell) {
    const segments = shellLine(line)
    const inner = segments
      .map((segment) => toneHtml(segment, SHELL_TONE_CLASS))
      .join('')
    return { classes: shellLineClasses(segments[0].tone), inner }
  }
  return { classes: OUTPUT_LINE, inner: escapeHtml(line) }
}

function shellLineClasses(firstTone: ShellTone): string {
  if (firstTone === 'prompt') return PROMPT_LINE
  return OUTPUT_LINE
}

function toneHtml<TTone extends string>(
  segment: Segment<TTone>,
  classByTone: Record<TTone, string | null>,
): string {
  const classes = classByTone[segment.tone]
  if (classes === null) return escapeHtml(segment.text)
  return `<span class="${classes}">${escapeHtml(segment.text)}</span>`
}

function newlineUnlessLast(index: number, last: number): string {
  if (index === last) return ''
  return '\n'
}

function nonEmpty<TTone extends string>(
  segments: Array<Segment<TTone>>,
): Array<Segment<TTone>> {
  return segments.filter((segment) => segment.text !== '')
}

function resolveDocsHref(pagePath: string, href: string): string {
  if (href.endsWith('.md') || href.includes('.md#')) {
    return resolveDocsLink(pagePath, href)
  }
  return href
}

function listTag(ordered: boolean): string {
  if (ordered) return 'ol'
  return 'ul'
}

function listPrefix(token: Tokens.List, index: number): string {
  if (token.ordered) return `${listStart(token.start) + index}.`
  if (index === token.items.length - 1) return '└──'
  return '├──'
}

function listStart(start: number | ''): number {
  if (start === '') return 1
  return start
}

function tocLevel(depth: number): 2 | 3 | null {
  if (depth === 2) return 2
  if (depth === 3) return 3
  return null
}

function slug(text: string): string {
  return stripBackticks(text.toLowerCase())
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function uniqueSlug(counts: Map<string, number>, base: string): string {
  const seen = counts.get(base) ?? 0
  counts.set(base, seen + 1)
  if (seen === 0) return base
  return `${base}-${seen}`
}

function stripBackticks(text: string): string {
  return text.replace(/`/g, '')
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}
