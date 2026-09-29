import { useEffect, useState } from 'react'
import type { Line, Step, Tone } from './terminalSteps'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'
import { TERMINAL_STEPS } from './terminalSteps'

type CurrentStep = { command: string; output: Array<Line>; cursor: boolean }
export type TerminalFrame = {
  done: Array<Step>
  current: CurrentStep
  status: string
  finished: boolean
}

const TICK_MS = 40
const TYPED_PAUSE_TICKS = 3
const TICKS_PER_OUTPUT_LINE = 2
const STEP_PAUSE_TICKS = 14
const TYPING_STATUS = 'typing…'
const PROMPT = '$ '
const IDLE_PROMPT: CurrentStep = { command: '', output: [], cursor: true }

const LINE = 'min-h-[1.45em] whitespace-pre-wrap [overflow-wrap:anywhere]'
const CURSOR =
  'ml-px inline-block h-[15px] w-2 bg-accent align-[-3px] animate-[blink_1s_steps(1)_infinite]'
const TONE_CLASS: Record<Tone, string> = {
  primary: 'text-primary',
  failure: 'text-failure',
  success: 'text-success',
  muted: 'text-muted',
}

export function terminalFrame(steps: Array<Step>, tick: number): TerminalFrame {
  const done: Array<Step> = []
  let remaining = tick
  for (const step of steps) {
    const typed = Math.min(remaining, step.command.length)
    if (typed < step.command.length) {
      const command = step.command.slice(0, typed)
      const current = { command, output: [], cursor: true }
      return { done, current, status: TYPING_STATUS, finished: false }
    }
    remaining -= step.command.length + TYPED_PAUSE_TICKS
    const revealed = Math.floor(remaining / TICKS_PER_OUTPUT_LINE)
    const shown = Math.min(step.output.length, Math.max(0, revealed))
    const current = {
      command: step.command,
      output: step.output.slice(0, shown),
      cursor: false,
    }
    if (shown < step.output.length) {
      return { done, current, status: step.running, finished: false }
    }
    remaining -= step.output.length * TICKS_PER_OUTPUT_LINE
    if (remaining < STEP_PAUSE_TICKS) {
      return { done, current, status: step.done, finished: false }
    }
    remaining -= STEP_PAUSE_TICKS
    done.push(step)
  }
  const last = steps[steps.length - 1]
  return { done, current: IDLE_PROMPT, status: last.done, finished: true }
}

function nextTick(tick: number): number {
  if (terminalFrame(TERMINAL_STEPS, tick).finished) return tick
  return tick + 1
}

type TerminalPaneProps = { className?: string }

export function TerminalPane({ className }: TerminalPaneProps) {
  const [tick, setTick] = useState(0)
  const frame = terminalFrame(TERMINAL_STEPS, tick)

  useEffect(() => {
    const interval = setInterval(() => setTick(nextTick), TICK_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <Pane
      title="terminal"
      titleRight="~/petstore_web"
      className={className}
      bodyClassName="min-h-[360px] text-[13px] leading-[1.45] md:min-h-[420px]"
      status={
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden whitespace-nowrap">
          <span>{frame.status}</span>
          <Button variant="ghost" onClick={() => setTick(0)}>
            [ replay ]
          </Button>
        </div>
      }
    >
      {frame.done.map((step) => (
        <StepLines key={step.command} step={step} cursor={false} />
      ))}
      <StepLines step={frame.current} cursor={frame.current.cursor} />
    </Pane>
  )
}

type StepLinesProps = {
  step: { command: string; output: Array<Line> }
  cursor: boolean
}

function StepLines({ step, cursor }: StepLinesProps) {
  return (
    <>
      <div className={LINE}>
        <span className="text-accent">{PROMPT}</span>
        <span className="text-primary">{step.command}</span>
        {cursor && <span className={CURSOR} />}
      </div>
      {step.output.map((line, index) => (
        <div key={index} className={`${LINE} ${TONE_CLASS[line.tone]}`}>
          {line.text}
        </div>
      ))}
    </>
  )
}
