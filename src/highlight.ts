export type Language = 'typescript' | 'php' | 'go' | 'json' | 'graphql'
export type TokenKind =
  | 'keyword'
  | 'type'
  | 'string'
  | 'key'
  | 'decorator'
  | 'number'
  | 'comment'
  | 'plain'
export type Token = { kind: TokenKind; text: string }
export type YamlTone = 'key' | 'colon' | 'value' | 'plain'
export type Segment<TTone extends string> = { text: string; tone: TTone }

export const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: 'text-syntax-keyword',
  type: 'text-syntax-type',
  string: 'text-syntax-string',
  key: 'text-secondary',
  decorator: 'text-syntax-decorator',
  number: 'text-syntax-number',
  comment: 'text-muted',
  plain: '',
}

export const LANGUAGE_BY_FENCE: Partial<Record<string, Language>> = {
  ts: 'typescript',
  typescript: 'typescript',
  js: 'typescript',
  php: 'php',
  go: 'go',
  json: 'json',
  graphql: 'graphql',
  gql: 'graphql',
}

const KEYWORDS: Record<Language, Set<string>> = {
  typescript: new Set(
    'import from export default class interface type enum function const let var return if else new null undefined true false async await extends implements number string boolean'.split(
      ' ',
    ),
  ),
  php: new Set(
    'namespace use final class interface enum public private protected readonly function return if else new null true false array int float string bool self static extends implements case match'.split(
      ' ',
    ),
  ),
  go: new Set(
    'package import type struct interface func var const return if else for range map nil true false int int64 float64 string bool error'.split(
      ' ',
    ),
  ),
  json: new Set(['true', 'false', 'null']),
  graphql: new Set(
    'query mutation subscription type input enum schema extend interface union scalar fragment on implements directive'.split(
      ' ',
    ),
  ),
}

const LINE_COMMENT: Record<Language, RegExp | null> = {
  typescript: /^\/\/.*/,
  php: /^(\/\/|#(?!\[)).*/,
  go: /^\/\/.*/,
  json: null,
  graphql: /^#.*/,
}

const BLOCK_COMMENT_LANGUAGES = new Set<Language>(['typescript', 'php', 'go'])

const TOKEN =
  /\/\*.*?\*\/|\/\*.*|\/\/.*|#\[[A-Za-z]\w*|#.*|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`|@[A-Za-z]\w*|\$[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|\s+|./g

export function highlightLines(
  code: string,
  language: Language,
): Array<Array<Token>> {
  let inBlockComment = false
  return code.split('\n').map((line) => {
    if (inBlockComment) {
      const end = line.indexOf('*/')
      if (end === -1) return [{ kind: 'comment', text: line }]
      inBlockComment = false
      return [
        { kind: 'comment', text: line.slice(0, end + 2) },
        ...highlightLine(line.slice(end + 2), language),
      ]
    }
    const tokens = highlightLine(line, language)
    const lastToken = tokens.at(-1)
    if (
      BLOCK_COMMENT_LANGUAGES.has(language) &&
      lastToken?.kind === 'comment' &&
      lastToken.text.startsWith('/*') &&
      !lastToken.text.endsWith('*/')
    ) {
      inBlockComment = true
    }
    return tokens
  })
}

function highlightLine(line: string, language: Language): Array<Token> {
  const texts = line.match(TOKEN) ?? []
  const tokens = texts.map((text) => ({
    kind: tokenKind(text, language),
    text,
  }))
  return tokens.map((token, index) => {
    if (token.kind === 'string' && followedByColon(tokens, index)) {
      return { ...token, kind: 'key' as const }
    }
    return token
  })
}

function tokenKind(text: string, language: Language): TokenKind {
  if (text.startsWith('/*')) return 'comment'
  if (LINE_COMMENT[language]?.test(text)) return 'comment'
  if (/^['"`]/.test(text)) return 'string'
  if (text.startsWith('@') || text.startsWith('#[')) return 'decorator'
  if (text.startsWith('#')) return 'plain'
  if (/^\d/.test(text)) return 'number'
  if (KEYWORDS[language].has(text)) return 'keyword'
  if (/^[A-Z]/.test(text)) return 'type'
  return 'plain'
}

function followedByColon(tokens: Array<Token>, index: number): boolean {
  const next = tokens.slice(index + 1).find((token) => token.text.trim() !== '')
  return next?.text === ':'
}

const YAML_TYPE_WORDS = new Set(
  'object string integer float number boolean array map any true false null ~'.split(
    ' ',
  ),
)

const YAML_KEY_LINE = /^(\s*)(-\s+)?("?[^:"]+"?)(:)(.*)$/

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

export function yamlSegmentKind(tone: YamlTone, text: string): TokenKind {
  const trimmed = text.trim()
  if (tone === 'plain' && trimmed.startsWith('#')) return 'comment'
  if (tone === 'key' && /^\d+$/.test(trimmed)) return 'number'
  if (tone === 'key') return 'key'
  if (tone === 'colon') return 'comment'
  if (tone !== 'value' || trimmed === '') return 'plain'
  if (YAML_TYPE_WORDS.has(trimmed)) return 'keyword'
  if (/^\d+(\.\d+)?$/.test(trimmed)) return 'number'
  if (/^[A-Z]\w*$/.test(trimmed)) return 'type'
  return 'string'
}

function nonEmpty<TTone extends string>(
  segments: Array<Segment<TTone>>,
): Array<Segment<TTone>> {
  return segments.filter((segment) => segment.text !== '')
}
