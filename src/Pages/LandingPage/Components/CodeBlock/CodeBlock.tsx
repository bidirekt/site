import { TOKEN_CLASS, highlightLines } from '#/highlight'
import type { Language } from '#/highlight'

type CodeBlockProps = { code: string; language: Language }

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre className="m-0 overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.75] whitespace-pre text-primary">
      {highlightLines(code, language).map((tokens, lineIndex) => (
        <span key={lineIndex} className="block min-h-[1.75em]">
          {tokens.map((token, index) => (
            <span key={index} className={TOKEN_CLASS[token.kind]}>
              {token.text}
            </span>
          ))}
        </span>
      ))}
    </pre>
  )
}
