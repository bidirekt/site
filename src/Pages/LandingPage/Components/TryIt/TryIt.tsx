import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Eyebrow } from '#/Components/Eyebrow'

const TRY_COMMAND = 'curl -sL bidirekt.com/try | sh'
const SCRIPT_URL = '/try'
const CLONE_COMMAND = 'git clone https://github.com/bidirekt/petstore-example'
const RUN_COMMAND = 'cd petstore-example && docker compose up'
const FEEDBACK_MS = 1800
const COPY_LABEL: Record<CopyOutcome, string> = {
  idle: '[ copy ]',
  copied: '[ copied ]',
  failed: '[ press ⌘C ]',
}
const COPY_ANNOUNCEMENT: Record<CopyOutcome, string> = {
  idle: '',
  copied: 'Copied to the clipboard.',
  failed: 'Could not copy. The command is selected; copy it with ⌘C or Ctrl+C.',
}

type CopyOutcome = 'idle' | 'copied' | 'failed'
type CopyButtonProps = { command: RefObject<HTMLElement | null> }

export function TryIt() {
  const command = useRef<HTMLElement>(null)

  return (
    <section id="try" className="flex flex-col gap-5 pt-[88px]">
      <Eyebrow>try it</Eyebrow>
      <p className="max-w-[620px] leading-[1.75] text-secondary">
        See a breaking change caught in one command. Runs the petstore example
        locally with Docker.
      </p>
      <div className="flex flex-wrap items-stretch gap-x-4 gap-y-2.5">
        <div className="flex min-w-0 flex-[1_1_420px] items-center justify-between gap-3 border border-[#232323] bg-[#0e0e0e] py-1.5 pr-1.5 pl-4">
          <pre className="overflow-x-auto text-[14px]">
            <span className="text-accent">$</span>{' '}
            <code ref={command}>{TRY_COMMAND}</code>
          </pre>
          <CopyButton command={command} />
        </div>
        <a
          href={SCRIPT_URL}
          className="pressable self-center text-[13px] text-secondary hover:text-accent"
        >
          [ view script ]
        </a>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[12px] text-muted">or, without curl | sh:</div>
        <pre className="overflow-x-auto border border-dashed border-[#232323] px-4 py-3 text-[13px] leading-[1.7] text-secondary">
          <span className="text-accent">$</span> {CLONE_COMMAND}
          {'\n'}
          <span className="text-accent">$</span> {RUN_COMMAND}
        </pre>
      </div>
    </section>
  )
}

function CopyButton({ command }: CopyButtonProps) {
  const [outcome, setOutcome] = useState<CopyOutcome>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = (next: CopyOutcome) => {
    setOutcome(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOutcome('idle'), FEEDBACK_MS)
  }

  const selectCommand = () => {
    if (command.current !== null) selectContents(command.current)
    show('failed')
  }

  const copy = () => {
    try {
      navigator.clipboard
        .writeText(TRY_COMMAND)
        .then(() => show('copied'), selectCommand)
    } catch {
      selectCommand()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy install command"
        className="pressable min-h-11 cursor-pointer border border-[#2a2a2a] px-3.5 py-2.5 text-[13px] leading-normal whitespace-nowrap text-primary hover:border-accent hover:text-accent"
      >
        {COPY_LABEL[outcome]}
      </button>
      <span aria-live="polite" className="sr-only">
        {COPY_ANNOUNCEMENT[outcome]}
      </span>
    </>
  )
}

function selectContents(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}
