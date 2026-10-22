import { Marked } from 'marked'
import type { Tokens } from 'marked'
import { pane } from '#/Components/Pane'
import { resolveDocsLink } from '#/docs'

export type TocEntry = { id: string; text: string; level: 2 | 3 }
export type YamlTone = 'key' | 'colon' | 'value' | 'plain'
export type ShellTone = 'prompt' | 'command' | 'output'
export type Segment<TTone extends string> = { text: string; tone: TTone }

type RenderOptions = { pagePath: string; title: string }
type RenderResult = { html: string; toc: Array<TocEntry> }
type CodeLine = { classes: string; inner: string }
type ListTag = 'ul' | 'ol'

const HEADING_BASE = 'max-w-[70ch] font-semibold text-primary scroll-mt-[84px]'
const HEADING_BY_DEPTH: Partial<Record<number, string>> = {
  1: 'mb-4 text-[40px] leading-[1.1] tracking-[-0.03em]',
  2: 'mt-14 mb-3.5 text-[28px] leading-[1.2] tracking-[-0.02em]',
  3: 'mt-10 mb-2.5 text-[20px] leading-[1.3] tracking-[-0.01em]',
}
const HEADING_DEEPER = 'mt-8 mb-2 text-[16px] leading-[1.4]'
const PARAGRAPH =
  'mb-[18px] max-w-[70ch] text-[16px] leading-[1.7] text-secondary text-pretty'
const CODESPAN =
  'rounded-[4px] bg-raised px-[5px] py-px text-[0.86em] [overflow-wrap:anywhere] text-primary'
const STRONG = 'font-medium text-primary'
const EM = 'italic text-secondary'
const LINK =
  'text-primary underline decoration-accent underline-offset-[3px] hover:text-accent'
const BLOCK_WIDTH = 'max-w-[760px]'
const PRE =
  'overflow-x-auto px-4 py-3.5 text-[13.5px] leading-[1.7] whitespace-pre text-primary'
const CODE_LINE = 'block min-h-[1.7em]'
const PROMPT_LINE = 'text-primary'
const OUTPUT_LINE = 'text-primary'
const TERMINAL_OUTPUT_LINE = 'text-secondary'
const VERDICT_LINE: Array<{ pattern: RegExp; classes: string }> = [
  {
    pattern: /^\S+ (\S+|local contract) cannot be deployed to \S+$/,
    classes: 'text-failure',
  },
  {
    pattern: /^\S+ (\S+|local contract) can be deployed to \S+$/,
    classes: 'text-success',
  },
]
const NOTE =
  'my-5 max-w-[70ch] shadow-[inset_2px_0_0_var(--color-accent),inset_0_1px_0_var(--color-sheen)]'
const NOTE_CONTENT =
  'text-[16px] leading-[1.7] text-primary [&_p]:text-primary [&_p:last-child]:mb-0'
const TABLE = 'w-full border-collapse text-[14px] leading-[1.6]'
const TABLE_HEADER_CELL =
  'bg-raised px-3.5 py-2.5 text-left text-[13px] font-medium text-muted whitespace-nowrap'
const TABLE_CELL =
  'border-t border-page px-3.5 py-2.5 align-top text-secondary [&_code]:whitespace-nowrap'
const LIST_BY_TAG: Record<ListTag, string> = {
  ul: 'mb-[18px] max-w-[70ch] list-disc pl-5 text-secondary marker:text-muted',
  ol: 'mb-[18px] max-w-[70ch] list-decimal pl-5 text-secondary marker:text-muted',
}
const LIST_ITEM =
  'mb-1.5 text-[16px] leading-[1.7] [&>p]:mb-1.5 [&>ul]:mt-1.5 [&>ol]:mt-1.5 [&>ul]:mb-0 [&>ol]:mb-0'
const RULE = 'my-10 max-w-[70ch] border-line'

const YAML_TONE_CLASS: Record<YamlTone, string | null> = {
  key: 'text-secondary',
  colon: 'text-muted',
  value: 'text-primary',
  plain: null,
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
        const root = pane().root({ className: NOTE })
        return `<blockquote class="${root}"><div class="px-4 py-3"><div class="${NOTE_CONTENT}">${this.parser.parse(tokens)}</div></div></blockquote>`
      },
      table(token) {
        const root = pane().root({
          className: `my-5 overflow-x-auto ${BLOCK_WIDTH}`,
        })
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
        return `<tr>${text}</tr>`
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
        const items = token.items.map((item) => this.listitem(item)).join('')
        return `<${tag}${listStartAttribute(token)} class="${LIST_BY_TAG[tag]}">${items}</${tag}>`
      },
      listitem(item) {
        return `<li class="${LIST_ITEM}">${this.parser.parse(item.tokens)}</li>`
      },
      hr() {
        return `<hr class="${RULE}">`
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
  const lines = code.split('\n')
  const terminal =
    SHELL_LANGS.has(lang) && lines.some((line) => line.startsWith('$ '))
  return `<section class="${pane().root({ className: `my-5 ${BLOCK_WIDTH}` })}"><pre class="${PRE}">${renderCodeLines(lines, lang, terminal)}</pre></section>`
}

// The newline lives inside each block span: between block boxes a preserved
// newline would lay out as an extra empty line.
function renderCodeLines(
  lines: Array<string>,
  lang: string,
  terminal: boolean,
): string {
  const last = lines.length - 1
  return lines
    .map((line, index) => {
      const { classes, inner } = codeLine(line, lang, terminal)
      const lineClasses = [CODE_LINE, classes].join(' ').trim()
      return `<span class="${lineClasses}">${inner}${newlineUnlessLast(index, last)}</span>`
    })
    .join('')
}

function codeLine(line: string, lang: string, terminal: boolean): CodeLine {
  if (lang === 'yaml') {
    const inner = yamlLine(line)
      .map((segment) => toneHtml(segment, YAML_TONE_CLASS))
      .join('')
    return { classes: '', inner }
  }
  if (terminal) return terminalLine(line)
  return { classes: OUTPUT_LINE, inner: escapeHtml(line) }
}

function terminalLine(line: string): CodeLine {
  const [first, second] = shellLine(line)
  if (first.tone === 'prompt') {
    return {
      classes: PROMPT_LINE,
      inner: `<span class="text-accent">${escapeHtml(first.text)}</span><span>${escapeHtml(second.text)}</span>`,
    }
  }
  const verdict = VERDICT_LINE.find(({ pattern }) => pattern.test(line))
  return {
    classes: verdict?.classes ?? TERMINAL_OUTPUT_LINE,
    inner: escapeHtml(line),
  }
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

function listTag(ordered: boolean): ListTag {
  if (ordered) return 'ol'
  return 'ul'
}

function listStartAttribute(token: Tokens.List): string {
  if (!token.ordered || token.start === '' || token.start === 1) return ''
  return ` start="${token.start}"`
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
