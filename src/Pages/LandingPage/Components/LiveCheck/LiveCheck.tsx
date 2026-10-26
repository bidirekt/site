import { useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { tv } from 'tailwind-variants'
import { pane } from '#/Components/Pane'
import { ExitChip } from '../ExitChip'

type WeightType = 'string' | 'integer'
type CheckState = { weightType: WeightType; readsStatus: boolean }
type LineTone = 'plain' | 'hit' | 'gone'

const INITIAL_STATE: CheckState = { weightType: 'string', readsStatus: true }
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const FLASH_KEYFRAMES = [
  { opacity: 0.35, filter: 'blur(2px)' },
  { opacity: 1, filter: 'blur(0)' },
]
const FLASH_TIMING = { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }

const COMMAND =
  'bidirekt can-i-deploy petstore_web --version 2.3.1 --environment production'
const DEPLOYABLE = `petstore_web 2.3.1 can be deployed to production
compared with: petstore_api`
const NOT_DEPLOYABLE = `petstore_web 2.3.1 cannot be deployed to production

petstore_api (1.4.0, deployed):`
const STATUS_BREAK = `  Pet.status — petstore_web reads it, but petstore_api doesn't provide it
    → petstore_web: stop reading it, or handle its absence in the code and mark it optional
    → petstore_api: provide it
      · GET /pets/* response 200 at "$.status"`
const WEIGHT_BREAK = `  Pet.weight — petstore_web reads it as string, but petstore_api provides integer
    → petstore_web: read it as integer
    → petstore_api: provide it as string there
      · GET /pets/* response 200 at "$.weight" (petstore_api: Pet.weight)`

const PROVIDER_PET = `provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string`
const PROVIDER_WEIGHT = `      weight:
        type: integer`
const PROVIDER_PHOTO = `      photoUrl:
        type: string`
const CONSUMER_PET = `consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: Pet
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string`

const PANE_HEAD =
  'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-raised px-4 py-3 text-[13px] text-muted'
const CODE = 'm-0 overflow-x-auto font-mono text-[13px] leading-[1.7]'

const yamlLine = tv({
  base: 'px-4 whitespace-pre transition-colors duration-150 motion-reduce:transition-none',
  variants: {
    tone: {
      plain: '',
      hit: 'bg-failure-bg shadow-[inset_2px_0_0_var(--color-failure)]',
      gone: 'text-muted [&>*]:line-through',
    },
  },
})

const toggle = tv({
  base: 'pressable cursor-pointer',
  variants: {
    off: { true: 'text-muted', false: 'text-accent' },
  },
})

export function LiveCheck() {
  const [state, setState] = useState(INITIAL_STATE)
  const output = useRef<HTMLPreElement>(null)

  function update(next: CheckState) {
    setState(next)
    flash(output)
  }

  function switchWeight() {
    update({ ...state, weightType: otherWeightType(state.weightType) })
  }

  function switchStatus() {
    update({ ...state, readsStatus: !state.readsStatus })
  }

  const readsWeightAsString = state.weightType === 'string'
  const breakCount = breaksOf(state).length

  return (
    <section
      id="check"
      aria-labelledby="check-title"
      className="pt-6 pb-16 md:pb-24"
    >
      <h2 id="check-title" className="sr-only">
        Live contract check
      </h2>
      <div className="animate-rise rounded-[18px] bg-linear-to-b [animation-delay:300ms] motion-reduce:animate-none from-accent/40 via-line via-35% to-white/3 p-px shadow-[0_40px_100px_-30px_rgba(245,165,36,0.16),0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="rounded-[17px] bg-[rgba(13,13,12,0.9)] p-2 md:p-3">
          <div
            role="group"
            aria-label="Change petstore_web's contract"
            className="flex flex-wrap items-center gap-2.5 px-1 pt-1 pb-3.5"
          >
            <span className="mr-0.5 text-[14px] text-secondary">
              Edit petstore_web's contract:
            </span>
            <Switch pressed={readsWeightAsString} onClick={switchWeight}>
              Read <code className="font-mono text-[13px]">weight</code> as
              string
            </Switch>
            <Switch pressed={state.readsStatus} onClick={switchStatus}>
              Read <code className="font-mono text-[13px]">status</code>
            </Switch>
            <span className="ml-auto text-[14px] text-secondary">
              <StatusText breakCount={breakCount} />
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-3">
            <ContractPane
              participant="petstore_api"
              role="provides"
              version="1.4.0 · deployed to production"
            >
              <YamlLines yaml={PROVIDER_PET} />
              <YamlLines
                yaml={PROVIDER_WEIGHT}
                tone={hitWhen(readsWeightAsString)}
              />
              <YamlLines yaml={PROVIDER_PHOTO} />
            </ContractPane>
            <ContractPane
              participant="petstore_web"
              role="consumes"
              version="2.3.1 · about to deploy"
            >
              <YamlLines yaml={CONSUMER_PET} />
              <YamlLines
                yaml="      weight:"
                tone={hitWhen(readsWeightAsString)}
              />
              <div className={yamlLine({ tone: hitWhen(readsWeightAsString) })}>
                <span className="text-muted">{'        type:'}</span>{' '}
                <button
                  type="button"
                  aria-label={`weight type is ${state.weightType}. Switch it.`}
                  className={toggle({ off: false })}
                  onClick={switchWeight}
                >
                  {state.weightType}
                </button>
              </div>
              <div
                className={yamlLine({ tone: statusTone(state.readsStatus) })}
              >
                {'      '}
                <button
                  type="button"
                  aria-pressed={state.readsStatus}
                  aria-label={statusToggleLabel(state.readsStatus)}
                  className={toggle({ off: !state.readsStatus })}
                  onClick={switchStatus}
                >
                  status
                </button>
                <span className="text-muted">:</span>
              </div>
              <YamlLines
                yaml="        type: string"
                tone={statusTone(state.readsStatus)}
              />
            </ContractPane>
          </div>
          <div className={pane().root({ className: 'mt-3 overflow-hidden' })}>
            <div className={PANE_HEAD}>
              <span className="font-mono">can-i-deploy</span>
              <ExitChip code={exitCode(breakCount)} />
            </div>
            <pre
              ref={output}
              aria-live="polite"
              className={`${CODE} p-4 whitespace-pre text-secondary`}
            >
              <span className="text-muted">$</span>{' '}
              <span className="text-primary">{COMMAND}</span>
              {'\n'}
              <Verdict state={state} />
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function Switch({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="group pressable inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-pane py-[7px] pr-3.5 pl-2 text-[14px] text-primary hover:border-accent/50"
    >
      <span
        aria-hidden="true"
        className="relative h-[18px] w-[30px] flex-none rounded-full bg-success/28 transition-colors duration-150 group-aria-pressed:bg-failure/30 motion-reduce:transition-none"
      >
        <span className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-success transition-[translate,background-color] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] group-aria-pressed:translate-x-3 group-aria-pressed:bg-failure motion-reduce:transition-none" />
      </span>
      {children}
    </button>
  )
}

function StatusText({ breakCount }: { breakCount: number }) {
  if (breakCount === 0) {
    return (
      <>
        <b className="font-medium text-success">Deployable.</b> Turn a switch on
        to break it.
      </>
    )
  }
  return (
    <>
      <b className="font-medium text-failure">{breakCountText(breakCount)}</b>{' '}
      Turn the switches off to fix.
    </>
  )
}

function ContractPane({
  participant,
  role,
  version,
  children,
}: {
  participant: string
  role: string
  version: string
  children: ReactNode
}) {
  return (
    <div className={pane().root({ className: 'overflow-hidden' })}>
      <div className={PANE_HEAD}>
        <span>
          <span className="font-mono text-[14px] font-medium text-primary">
            {participant}
          </span>{' '}
          <span className="text-secondary">{role}</span>
        </span>
        <span>{version}</span>
      </div>
      <div className={`${CODE} py-3`}>
        <div className="w-max min-w-full">{children}</div>
      </div>
    </div>
  )
}

function YamlLines({
  yaml,
  tone = 'plain',
}: {
  yaml: string
  tone?: LineTone
}) {
  return yaml.split('\n').map((line, index) => {
    const indent = line.length - line.trimStart().length
    const keyEnd = line.indexOf(':') + 1
    return (
      <div key={index} className={yamlLine({ tone })}>
        {line.slice(0, indent)}
        <span className="text-muted">{line.slice(indent, keyEnd)}</span>
        <span>{line.slice(keyEnd)}</span>
      </div>
    )
  })
}

function Verdict({ state }: { state: CheckState }) {
  const breaks = breaksOf(state)
  if (breaks.length === 0) {
    const [verdict, rest] = DEPLOYABLE.split('\n')
    return (
      <>
        <span className="text-success">{verdict}</span>
        {`\n${rest}`}
      </>
    )
  }
  const [verdict, ...rest] = [NOT_DEPLOYABLE, ...breaks].join('\n').split('\n')
  return (
    <>
      <span className="text-failure">{verdict}</span>
      {rest.map((line, index) => (
        <OutputLine key={index} line={line} />
      ))}
    </>
  )
}

function OutputLine({ line }: { line: string }) {
  const content = line.trimStart()
  const indent = line.slice(0, line.length - content.length)
  if (content.startsWith('→')) {
    const prefixEnd = content.indexOf(':') + 1
    return (
      <>
        {`\n${indent}`}
        <span className="text-accent">{content.slice(0, prefixEnd)}</span>
        {content.slice(prefixEnd)}
      </>
    )
  }
  if (content.startsWith('·')) {
    return (
      <>
        {`\n${indent}`}
        <span className="text-muted">{content}</span>
      </>
    )
  }
  return `\n${line}`
}

function breaksOf(state: CheckState): Array<string> {
  const breaks: Array<string> = []
  if (state.readsStatus) breaks.push(STATUS_BREAK)
  if (state.weightType === 'string') breaks.push(WEIGHT_BREAK)
  return breaks
}

function breakCountText(breakCount: number): string {
  if (breakCount === 1) return '1 break.'
  return `${breakCount} breaks.`
}

function exitCode(breakCount: number): number {
  if (breakCount === 0) return 0
  return 1
}

function otherWeightType(weightType: WeightType): WeightType {
  if (weightType === 'string') return 'integer'
  return 'string'
}

function hitWhen(breaks: boolean): LineTone {
  if (breaks) return 'hit'
  return 'plain'
}

function statusTone(readsStatus: boolean): LineTone {
  if (readsStatus) return 'hit'
  return 'gone'
}

function statusToggleLabel(readsStatus: boolean): string {
  if (readsStatus) return 'Stop reading status'
  return 'Read status again'
}

function flash(output: RefObject<HTMLPreElement | null>) {
  if (window.matchMedia(REDUCED_MOTION).matches) return
  output.current?.animate(FLASH_KEYFRAMES, FLASH_TIMING)
}
