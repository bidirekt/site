import { useEffect, useState } from 'react'
import type { TerminalLine, Tone } from './terminalLines'
import { TERMINAL_LINES } from './terminalLines'

const FIRST_LINE_MS = 400
const COMMAND_LINE_MS = 900
const OUTPUT_LINE_MS = 220
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const PROMPT = 'petstore_web ❯'

const TONE_CLASS: Record<Tone, string> = {
  plain: '',
  failure: 'text-failure',
  success: 'text-success',
  muted: 'text-muted',
}
const LINE = 'px-[18px] transition-opacity duration-200 ease-[ease]'
const DOT = 'size-[11px] rounded-full'
const CURSOR =
  'inline-block h-[15px] w-2 bg-accent align-[-2px] animate-[blink_1s_steps(1)_infinite] motion-reduce:animate-none'

export function TerminalPane() {
  const shown = useLineReplay()

  return (
    <section aria-label="Terminal demo" className="pb-[88px]">
      <div className="min-w-0 overflow-hidden border border-[#262626] bg-pane shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        <div
          className="flex gap-[7px] border-b border-[#222] bg-[#161616] px-3.5 py-2.5"
          aria-hidden="true"
        >
          <span className={`${DOT} bg-[#3a3a3a]`} />
          <span className={`${DOT} bg-[#3a3a3a]`} />
          <span className={`${DOT} bg-accent`} />
        </div>
        <div className="overflow-x-auto py-[18px] text-[13px] leading-[1.75]">
          {TERMINAL_LINES.map((line, index) => (
            <pre key={index} className={lineClass(line, index < shown)}>
              <LineText line={line} />
            </pre>
          ))}
        </div>
      </div>
    </section>
  )
}

function LineText({ line }: { line: TerminalLine }) {
  return (
    <>
      {line.command && <span className="text-accent">{PROMPT} </span>}
      {line.text}
      {line.hint !== undefined && (
        <span className="text-accent">{line.hint}</span>
      )}
      {line.cursor && <span className={CURSOR} />}
    </>
  )
}

function lineClass(line: TerminalLine, visible: boolean): string {
  const classes = [LINE, TONE_CLASS[line.tone]]
  if (line.gapBefore) classes.push('mt-5')
  if (!visible) classes.push('opacity-0')
  return classes.join(' ')
}

function useLineReplay(): number {
  const [shown, setShown] = useState(TERMINAL_LINES.length)

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return
    let timer: ReturnType<typeof setTimeout>
    const reveal = (count: number) => {
      setShown(count)
      if (count === TERMINAL_LINES.length) return
      timer = setTimeout(() => reveal(count + 1), revealDelay(count))
    }
    reveal(0)
    return () => clearTimeout(timer)
  }, [])

  return shown
}

function revealDelay(index: number): number {
  if (index === 0) return FIRST_LINE_MS
  if (TERMINAL_LINES[index].command) return COMMAND_LINE_MS
  return OUTPUT_LINE_MS
}
