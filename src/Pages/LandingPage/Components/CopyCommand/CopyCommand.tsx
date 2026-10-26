import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

const FEEDBACK_MS = 1600
const COPY_LABEL: Record<CopyOutcome, string> = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Press ⌘C',
}
const COPY_ANNOUNCEMENT: Record<CopyOutcome, string> = {
  idle: '',
  copied: 'Copied to the clipboard.',
  failed: 'Could not copy. The command is selected; copy it with ⌘C or Ctrl+C.',
}

type CopyOutcome = 'idle' | 'copied' | 'failed'

const copyCommand = tv({
  base: 'flex max-w-full min-w-0 items-center rounded-[8px] bg-raised font-mono text-[15px] max-[480px]:w-full max-[480px]:text-[13px] max-[380px]:text-[12px]',
  variants: {
    lit: {
      true: 'border border-accent/35 shadow-[0_0_0_4px_rgba(245,165,36,0.05),0_10px_32px_-12px_rgba(245,165,36,0.45)]',
    },
  },
})

type CopyCommandProps = { command: string; lit?: boolean; className?: string }

export function CopyCommand({ command, lit, className }: CopyCommandProps) {
  const [outcome, setOutcome] = useState<CopyOutcome>('idle')
  const commandText = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = (next: CopyOutcome) => {
    setOutcome(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOutcome('idle'), FEEDBACK_MS)
  }

  const selectCommand = () => {
    if (commandText.current !== null) selectContents(commandText.current)
    show('failed')
  }

  const copy = () => {
    try {
      navigator.clipboard
        .writeText(command)
        .then(() => show('copied'), selectCommand)
    } catch {
      selectCommand()
    }
  }

  return (
    <div className={copyCommand({ lit, className })}>
      <code className="min-w-0 flex-1 overflow-x-auto px-4 py-3 whitespace-nowrap max-[480px]:px-3">
        <span className="text-accent">$</span>{' '}
        <span ref={commandText}>{command}</span>
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command"
        className="pressable cursor-pointer self-stretch border-l border-page px-4 font-sans text-[14px] font-medium whitespace-nowrap text-secondary hover:text-primary max-[480px]:px-3"
      >
        {COPY_LABEL[outcome]}
      </button>
      <span aria-live="polite" className="sr-only">
        {COPY_ANNOUNCEMENT[outcome]}
      </span>
    </div>
  )
}

function selectContents(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}
