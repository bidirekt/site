import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { pane } from '#/Components/Pane'
import { ExitChip } from '../ExitChip'
import { SectionHeading } from '../SectionHeading'

type Step = {
  name: string
  summary: string
  command: string
  output: ReactNode
  exitCode: number
}

const BROKER = 'Broker: http://localhost:18090 (profile: default)'

const STEPS: Array<Step> = [
  {
    name: 'publish',
    summary: "Send this version's contract to the broker.",
    command:
      'bidirekt publish ./contracts/*.yaml --participant petstore_web --version 2.3.1',
    output: `${BROKER}\npetstore_web contract publish successful`,
    exitCode: 0,
  },
  {
    name: 'can-i-deploy',
    summary: 'Compare it against what is deployed.',
    command:
      'bidirekt can-i-deploy petstore_web --version 2.3.1 --environment production',
    output: (
      <>
        {`${BROKER}\n`}
        <span className="text-success">
          petstore_web 2.3.1 can be deployed to production
        </span>
        {'\ncompared with: petstore_api'}
      </>
    ),
    exitCode: 0,
  },
  {
    name: 'record-deployment',
    summary: 'After the deploy, tell the broker what runs where.',
    command:
      'bidirekt record-deployment petstore_web --version 2.3.1 --environment production',
    output: `${BROKER}\npetstore_web deployment recorded to production`,
    exitCode: 0,
  },
]

const DEPLOY_COMMAND = './deploy.sh'
const CI_COMMANDS = [
  'bidirekt publish ./contracts/*.yaml --participant petstore_web --version $SHA',
  'bidirekt can-i-deploy petstore_web --version $SHA --environment production',
  DEPLOY_COMMAND,
  'bidirekt record-deployment petstore_web --version $SHA --environment production',
]

const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const PREVIOUS_KEYS = ['ArrowUp', 'ArrowLeft']
const OUTPUT_ID = 'command-output'

const OUTPUT =
  'm-0 overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] whitespace-pre text-secondary'

const tab = tv({
  base: 'pressable grid cursor-pointer gap-0.5 rounded-[8px] px-4 py-3.5 text-left hover:bg-raised aria-selected:bg-raised',
  slots: {
    number: 'font-mono text-[12px] leading-normal font-medium text-muted',
    name: 'font-mono text-[15px] leading-normal font-medium max-[720px]:text-[13px] max-[720px]:[overflow-wrap:anywhere]',
    summary: 'text-[14px] text-secondary max-[720px]:hidden',
  },
  variants: {
    selected: { true: { name: 'text-accent' } },
  },
})

export function Commands() {
  const [selected, setSelected] = useState(0)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const step = STEPS[selected]

  function selectAndFocus(index: number) {
    setSelected(index)
    tabs.current[index]?.focus()
  }

  function moveSelection(event: KeyboardEvent, index: number) {
    if (NEXT_KEYS.includes(event.key)) {
      event.preventDefault()
      selectAndFocus((index + 1) % STEPS.length)
    }
    if (PREVIOUS_KEYS.includes(event.key)) {
      event.preventDefault()
      selectAndFocus((index + STEPS.length - 1) % STEPS.length)
    }
  }

  return (
    <section
      aria-labelledby="steps-title"
      className="py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading
        id="steps-title"
        title="Three commands in your pipeline"
        lede={
          <>
            Publish the contract, ask before you deploy, record what shipped.
            The exit code of{' '}
            <code className="whitespace-nowrap">can-i-deploy</code> is the gate
            in CI.
          </>
        }
      />
      <div className="grid grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-3 max-[720px]:grid-cols-[minmax(0,1fr)]">
        <div
          role="tablist"
          aria-label="Commands"
          className="grid content-start gap-1 max-[720px]:grid-cols-3"
        >
          {STEPS.map(({ name, summary }, index) => {
            const isSelected = index === selected
            const slots = tab({ selected: isSelected })
            return (
              <button
                key={name}
                ref={(element) => {
                  tabs.current[index] = element
                }}
                type="button"
                role="tab"
                id={tabId(index)}
                aria-controls={OUTPUT_ID}
                aria-selected={isSelected}
                tabIndex={rovingTabIndex(isSelected)}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => moveSelection(event, index)}
                className={slots.base()}
              >
                <span className={slots.number()}>{index + 1}</span>
                <span className={slots.name()}>{name}</span>
                <span className={slots.summary()}>{summary}</span>
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id={OUTPUT_ID}
          aria-labelledby={tabId(selected)}
          className={pane().root({ className: 'overflow-hidden bg-page' })}
        >
          <div className="flex items-baseline justify-between gap-3 bg-raised px-4 py-3 text-[13px] text-muted">
            <span className="font-mono">~/petstore_web</span>
            <ExitChip code={step.exitCode} />
          </div>
          <pre className={OUTPUT}>
            <span className="text-muted">$</span>{' '}
            <span className="text-primary">{step.command}</span>
            {'\n'}
            {step.output}
          </pre>
        </div>
      </div>
      <div className="mt-7">
        <h3 className="mb-2.5 text-[15px] font-medium text-secondary">
          The same three lines in any CI
        </h3>
        <div className={pane().root({ className: 'overflow-hidden bg-page' })}>
          <pre className={OUTPUT}>
            {CI_COMMANDS.map((command, index) => (
              <CiLine key={command} command={command} first={index === 0} />
            ))}
          </pre>
        </div>
      </div>
    </section>
  )
}

function CiLine({ command, first }: { command: string; first: boolean }) {
  return (
    <>
      {!first && '\n'}
      <span className="text-muted">- run:</span> <CiCommand command={command} />
    </>
  )
}

function CiCommand({ command }: { command: string }) {
  if (command === DEPLOY_COMMAND) return command
  return <span className="text-primary">{command}</span>
}

function rovingTabIndex(isSelected: boolean): number {
  if (isSelected) return 0
  return -1
}

function tabId(index: number): string {
  return `command-tab-${index}`
}
