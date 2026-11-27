import { highlight } from './highlight'
import type { Language, TokenKind } from './highlight'

const KIND_CLASS: Record<TokenKind, string> = {
  keyword: 'text-syntax-keyword',
  type: 'text-syntax-type',
  string: 'text-syntax-string',
  decorator: 'text-syntax-decorator',
  number: 'text-syntax-number',
  plain: '',
}

type CodeBlockProps = { code: string; language: Language }

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre className="m-0 overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.75] whitespace-pre text-primary">
      {highlight(code, language).map((token, index) => (
        <span key={index} className={KIND_CLASS[token.kind]}>
          {token.text}
        </span>
      ))}
    </pre>
  )
}
