import { TOKEN_CLASS, highlightLines } from '#/highlight'
import type { Language, Token } from '#/highlight'

type CodeBlockProps = { code: string; language: Language }

const TAB_WIDTH = 8
const HANGING_INDENT = 2

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre className="m-0 px-4 py-3 font-mono text-[13px] leading-[1.75] text-primary">
      {highlightLines(expandLeadingTabs(code), language).map(
        (tokens, lineIndex) => {
          const { indent, rest } = splitIndent(tokens)
          return (
            <span
              key={lineIndex}
              style={{
                paddingLeft: `${indent + HANGING_INDENT}ch`,
                textIndent: `-${HANGING_INDENT}ch`,
              }}
              className="block min-h-[1.75em] whitespace-pre-wrap [overflow-wrap:anywhere]"
            >
              {rest.map((token, index) => (
                <span key={index} className={TOKEN_CLASS[token.kind]}>
                  {token.text}
                </span>
              ))}
            </span>
          )
        },
      )}
    </pre>
  )
}

function expandLeadingTabs(code: string): string {
  return code.replace(/^\t+/gm, (tabs) => ' '.repeat(tabs.length * TAB_WIDTH))
}

// The indentation moves into the padding, where a wrap can't break after it,
// and a wrapped line continues two columns in.
function splitIndent(tokens: Array<Token>) {
  let indent = 0
  const rest: Array<Token> = []
  for (const token of tokens) {
    if (rest.length > 0) {
      rest.push(token)
      continue
    }
    const text = token.text.trimStart()
    indent += token.text.length - text.length
    if (text !== '') rest.push({ ...token, text })
  }
  return { indent, rest }
}
