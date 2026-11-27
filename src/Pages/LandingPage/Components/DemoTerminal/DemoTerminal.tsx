import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { pane } from '#/Components/Pane'
import { ExitChip } from '../ExitChip'
import { SCRIPT } from './script'
import type { LineKind, ScriptLine } from './script'

const FIRST_LINE_MS = 250
const KEYSTROKE_MS = 22
const AFTER_COMMAND_MS = 420
const AFTER_STEP_MS = 750
const AFTER_LINE_MS = 110
const AFTER_VERDICT_MS = 2200
const BEFORE_REPLAY_MS = 5000
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const LINE_CLASS: Record<LineKind, string> = {
  step: 'mt-2 text-muted',
  command: 'text-primary',
  output: '',
  failed: 'text-failure',
  passed: 'text-success',
  fix: 'text-primary',
  added: 'text-success',
}

const CONTROL =
  'pressable cursor-pointer rounded-[8px] px-2.5 py-1 font-sans text-[13px] font-medium text-secondary hover:bg-raised hover:text-primary'

export function DemoTerminal() {
  const [shown, setShown] = useState(SCRIPT.length)
  const [typed, setTyped] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [animated, setAnimated] = useState(false)
  const root = useRef<HTMLElement>(null)
  const screen = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return
    setAnimated(true)
    setShown(0)
  }, [])

  useEffect(() => {
    const element = root.current
    if (element === null) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!animated || paused || !visible) return
    const timer = setTimeout(
      () => {
        if (shown >= SCRIPT.length) {
          setShown(0)
          setTyped(0)
          return
        }
        const line = SCRIPT[shown]
        if (line.kind === 'command' && typed < line.text.length) {
          setTyped(typed + 1)
          return
        }
        setShown(shown + 1)
        setTyped(0)
      },
      nextDelay(shown, typed),
    )
    return () => clearTimeout(timer)
  }, [animated, paused, visible, shown, typed])

  useEffect(() => {
    const element = screen.current
    if (element !== null) element.scrollTop = element.scrollHeight
  }, [shown, typed])

  function replay() {
    setShown(0)
    setTyped(0)
    setPaused(false)
  }

  const current = SCRIPT.at(shown)
  const exitCode = lastExitCode(shown)

  return (
    <section
      ref={root}
      aria-label="The petstore demo, replayed"
      className={pane().root({ className: 'overflow-hidden text-left' })}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span className="font-mono text-[12px] text-muted">
          ~/petstore-example
        </span>
        <div className="flex items-center gap-2">
          {exitCode !== undefined && <ExitChip code={exitCode} />}
          {animated && (
            <>
              <button
                type="button"
                className={CONTROL}
                onClick={() => setPaused(!paused)}
              >
                {pauseLabel(paused)}
              </button>
              <button type="button" className={CONTROL} onClick={replay}>
                Replay
              </button>
            </>
          )}
        </div>
      </div>
      <div
        ref={screen}
        className="h-[440px] overflow-y-auto px-4 py-3 font-mono text-[13px] leading-[1.75] text-secondary [scrollbar-width:none] max-[720px]:h-[400px] [&::-webkit-scrollbar]:hidden"
      >
        {SCRIPT.slice(0, shown).map((line, index) => (
          <Line key={index} line={line} />
        ))}
        {current?.kind === 'command' && (
          <Line line={current} typed={typed} withCaret />
        )}
      </div>
    </section>
  )
}

type LineProps = { line: ScriptLine; typed?: number; withCaret?: boolean }

function Line({ line, typed, withCaret = false }: LineProps) {
  const text = line.text.slice(0, typed ?? line.text.length)
  return (
    <div
      className={`min-h-[1.75em] whitespace-pre-wrap [overflow-wrap:anywhere] ${LINE_CLASS[line.kind]}`}
    >
      {line.kind === 'command' && <span className="text-muted">$ </span>}
      {text}
      {line.step !== undefined && (
        <span className="font-sans font-medium text-primary">{line.step}</span>
      )}
      {withCaret && (
        <span
          aria-hidden="true"
          className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-primary"
        />
      )}
    </div>
  )
}

function nextDelay(shown: number, typed: number): number {
  if (shown >= SCRIPT.length) return BEFORE_REPLAY_MS
  if (shown === 0) return FIRST_LINE_MS
  const line = SCRIPT[shown]
  if (line.kind === 'command' && typed < line.text.length) return KEYSTROKE_MS
  if (line.kind === 'command') return AFTER_COMMAND_MS
  if (SCRIPT.at(shown - 1)?.exitCode !== undefined) return AFTER_VERDICT_MS
  if (line.kind === 'step') return AFTER_STEP_MS
  return AFTER_LINE_MS
}

function lastExitCode(shown: number): number | undefined {
  const withExit = SCRIPT.slice(0, shown).filter(
    (line) => line.exitCode !== undefined,
  )
  return withExit.at(-1)?.exitCode
}

function pauseLabel(paused: boolean): string {
  if (paused) return 'Play'
  return 'Pause'
}
