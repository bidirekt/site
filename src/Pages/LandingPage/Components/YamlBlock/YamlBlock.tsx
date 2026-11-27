import { yamlLine } from '#/markdown'
import type { YamlTone } from '#/markdown'

const TONE: Record<YamlTone, string> = {
  key: 'text-secondary',
  colon: 'text-muted',
  value: 'text-primary',
  plain: '',
}

export function YamlBlock({ yaml }: { yaml: string }) {
  return (
    <pre className="m-0 py-3 font-mono text-[13px] leading-[1.75]">
      {yaml.split('\n').map((line, index) => (
        <span
          key={index}
          className="block px-4 whitespace-pre-wrap [overflow-wrap:anywhere]"
        >
          {yamlLine(line).map((segment, segmentIndex) => (
            <span
              key={segmentIndex}
              className={toneClass(segment.tone, segment.text)}
            >
              {segment.text}
            </span>
          ))}
        </span>
      ))}
    </pre>
  )
}

function toneClass(tone: YamlTone, text: string): string {
  if (tone === 'key' && /^\d+$/.test(text)) return 'text-syntax-number'
  if (tone !== 'value') return TONE[tone]
  if (/^\s*[A-Z]/.test(text)) return 'text-syntax-type'
  return 'text-syntax-keyword'
}
