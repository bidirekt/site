import { Marked } from 'marked'
import type { Tokens } from 'marked'
import { pane } from '#/Components/Pane'
import { resolveDocsLink } from '#/docs'
import { headingIdsOfPage } from '#/headings'

export type TocEntry = { id: string; text: string; level: 2 | 3 }
export type YamlTone = 'key' | 'colon' | 'value' | 'plain'
export type ShellTone = 'prompt' | 'command' | 'output'
export type Segment<TTone extends string> = { text: string; tone: TTone }

type RenderOptions = { pagePath: string; title: string }
type RenderResult = { html: string; toc: Array<TocEntry> }
type CodeLine = { classes: string; inner: string }
type CodeInfo = { lang: string; title: string | null }
type CodeKind = 'code' | 'error'
type ListTag = 'ul' | 'ol'

export const COPY_CODE_ATTRIBUTE = 'data-copy-code'
export const COPY_LABEL = 'Copy'

const HEADING_BASE =
  'group max-w-[70ch] font-semibold text-primary scroll-mt-[84px]'
const HEADING_ANCHOR =
  'ml-2 font-normal text-muted no-underline opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none'
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
const CODE_PANE = `my-5 overflow-hidden ${BLOCK_WIDTH}`
const CODE_HEADER =
  'flex items-center justify-between py-1.5 pr-2 pl-3.5 font-mono text-[12px] font-medium'
const CODE_PANE_BY_KIND: Record<CodeKind, string> = {
  code: CODE_PANE,
  error: `${CODE_PANE} border-failure/22 bg-failure-bg`,
}
const CODE_HEADER_BY_KIND: Record<CodeKind, string> = {
  code: `${CODE_HEADER} bg-raised text-muted`,
  error: `${CODE_HEADER} bg-failure/14 text-failure`,
}
const CODE_TITLE_BY_KIND: Record<CodeKind, string> = {
  code: 'text-secondary',
  error: 'text-failure',
}
const COPY_BUTTON =
  'pressable cursor-pointer rounded-[5px] px-2 py-1 font-sans text-[12px] font-medium text-secondary hover:bg-pane hover:text-primary'
const CODE_LINE = 'block min-h-[1.7em]'
const ERROR_HEADLINE = 'text-failure'
const ERROR_DETAIL = 'text-secondary'
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
  'border-t border-page px-3.5 py-2.5 align-top text-secondary [&_code]:[overflow-wrap:normal]'
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
const ERROR_LANG = 'error'
const CAN_I_DEPLOY_TITLE = 'can-i-deploy output'
const CODE_INFO = /^(\S*)(.*)$/
const CODE_TITLE_ATTRIBUTE = /title="([^"]*)"/
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
  const headingIdOf = headingIdsOfPage(options.title)

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const id = headingIdOf({ text, depth })
        if (id === null) return ''
        const level = tocLevel(depth)
        if (level !== null) toc.push({ id, text: stripBackticks(text), level })
        const classes = HEADING_BY_DEPTH[depth] ?? HEADING_DEEPER
        return `<h${depth} id="${id}" class="${HEADING_BASE} ${classes}">${this.parser.parseInline(tokens)}${headingAnchor(id, text, level)}</h${depth}>`
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

function headingAnchor(
  id: string,
  text: string,
  level: TocEntry['level'] | null,
): string {
  if (level === null) return ''
  const label = escapeHtml(`Link to ${stripBackticks(text)}`)
  return `<a href="#${id}" class="${HEADING_ANCHOR}" aria-label="${label}" data-pagefind-ignore>#</a>`
}

function renderCodePane(code: string, info: string): string {
  const { lang, title } = codeInfo(info)
  const lines = code.split('\n')
  const terminal =
    SHELL_LANGS.has(lang) && lines.some((line) => line.startsWith('$ '))
  const kind = codeKind(lang)
  const label = codeLabel({ lang, title }, terminal, kind)
  return `<section class="${pane().root({ className: CODE_PANE_BY_KIND[kind] })}"><div class="${CODE_HEADER_BY_KIND[kind]}" data-pagefind-ignore>${label}<button type="button" class="${COPY_BUTTON}" ${COPY_CODE_ATTRIBUTE} aria-live="polite">${COPY_LABEL}</button></div><pre class="${PRE}">${renderCodeLines(lines, { lang, title }, terminal)}</pre></section>`
}

function codeInfo(info: string): CodeInfo {
  const [, lang, rest] = CODE_INFO.exec(info.trim()) ?? ['', '', '']
  const title = CODE_TITLE_ATTRIBUTE.exec(rest)?.[1] ?? null
  return { lang, title }
}

function codeKind(lang: string): CodeKind {
  if (lang === ERROR_LANG) return 'error'
  return 'code'
}

function codeLabel(
  { lang, title }: CodeInfo,
  terminal: boolean,
  kind: CodeKind,
): string {
  if (title !== null) {
    return `<span class="${CODE_TITLE_BY_KIND[kind]}">${escapeHtml(title)}</span>`
  }
  return `<span>${languageLabel(lang, terminal)}</span>`
}

function languageLabel(lang: string, terminal: boolean): string {
  if (terminal) return 'terminal'
  if (lang === 'yaml' || lang === 'json' || lang === ERROR_LANG) return lang
  return 'text'
}

// The newline lives inside each block span: between block boxes a preserved
// newline would lay out as an extra empty line.
function renderCodeLines(
  lines: Array<string>,
  info: CodeInfo,
  terminal: boolean,
): string {
  const last = lines.length - 1
  return lines
    .map((line, index) => {
      const { classes, inner } = codeLine(line, index, info, terminal)
      const lineClasses = [CODE_LINE, classes].join(' ').trim()
      return `<span class="${lineClasses}">${inner}${newlineUnlessLast(index, last)}</span>`
    })
    .join('')
}

function codeLine(
  line: string,
  index: number,
  { lang, title }: CodeInfo,
  terminal: boolean,
): CodeLine {
  if (lang === ERROR_LANG) {
    return {
      classes: errorLineClasses(line, index, title),
      inner: escapeHtml(line),
    }
  }
  if (lang === 'yaml') {
    const inner = yamlLine(line)
      .map((segment) => toneHtml(segment, YAML_TONE_CLASS))
      .join('')
    return { classes: '', inner }
  }
  if (terminal) return terminalLine(line)
  return { classes: OUTPUT_LINE, inner: escapeHtml(line) }
}

// A can-i-deploy fragment starts with a counterpart header, not with the
// error: only its verdict line, when shown, is the headline.
function errorLineClasses(
  line: string,
  index: number,
  title: string | null,
): string {
  const verdict = VERDICT_LINE.find(({ pattern }) => pattern.test(line))
  if (verdict !== undefined) return verdict.classes
  if (index === 0 && title !== CAN_I_DEPLOY_TITLE) return ERROR_HEADLINE
  return ERROR_DETAIL
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

function stripBackticks(text: string): string {
  return text.replace(/`/g, '')
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}
