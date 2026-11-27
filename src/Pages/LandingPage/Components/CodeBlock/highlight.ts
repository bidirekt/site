export type Language = 'typescript' | 'php' | 'go'
export type TokenKind =
  'keyword' | 'type' | 'string' | 'decorator' | 'number' | 'plain'
export type Token = { kind: TokenKind; text: string }

const KEYWORDS: Record<Language, Set<string>> = {
  typescript: new Set([
    'import',
    'from',
    'export',
    'class',
    'function',
    'const',
    'return',
    'null',
    'new',
    'number',
    'string',
  ]),
  php: new Set([
    'final',
    'class',
    'public',
    'function',
    'array',
    'null',
    'new',
    'return',
    'int',
    'string',
  ]),
  go: new Set([
    'type',
    'struct',
    'var',
    'func',
    'return',
    'nil',
    'int64',
    'string',
  ]),
}

const TOKEN =
  /('[^']*'|"[^"]*"|`[^`]*`|@[A-Za-z]\w*|#\[[A-Za-z]\w*|\$[A-Za-z_]\w*|\b\d+\b|[A-Za-z_]\w*|\s+|.)/g

export function highlight(code: string, language: Language): Array<Token> {
  const keywords = KEYWORDS[language]
  return (code.match(TOKEN) ?? []).map((text) => ({
    kind: tokenKind(text, keywords),
    text,
  }))
}

function tokenKind(text: string, keywords: Set<string>): TokenKind {
  if (/^['"`]/.test(text)) return 'string'
  if (text.startsWith('@') || text.startsWith('#[')) return 'decorator'
  if (/^\d+$/.test(text)) return 'number'
  if (keywords.has(text)) return 'keyword'
  if (/^[A-Z]/.test(text)) return 'type'
  return 'plain'
}
