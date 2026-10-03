import type { ReactNode } from 'react'
import type { Segment, YamlTone } from '#/markdown'
import { Eyebrow } from '#/Components/Eyebrow'
import { Pane } from '#/Components/Pane'
import { yamlLine } from '#/markdown'

type Highlight = { line: number; highlight: string }
type ContractTone = YamlTone | 'failure'

const PROSE = 'text-[14px] leading-[1.7] text-secondary text-pretty'
const GRID = 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4'

const INTRO_LEFT =
  'The provider declares what it produces. The consumer declares what it reads. Neither knows about the other; both publish to the broker.'
const INTRO_RIGHT =
  "The broker checks that every required property on the reading side exists, with the same type, on the producing side. Two lines below don't line up — and that is the whole report."

const PROVIDER_YAML = `provides:
  rest:
    "/pets/*":
      get:
        responses:
          "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId: { type: integer }
      name: { type: string }
      weight: { type: integer }
      photoUrl: { type: string }`
const PROVIDER_HIGHLIGHTS: Array<Highlight> = [
  { line: 12, highlight: 'integer' },
]

const CONSUMER_YAML = `consumes:
  petstore_api:
    rest:
      "/pets/*":
        get:
          responses:
            "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId: { type: integer }
      name: { type: string }
      weight: { type: string }
      status: { type: string }  # petstore_api doesn't provide it`
const CONSUMER_HIGHLIGHTS: Array<Highlight> = [
  { line: 13, highlight: 'string' },
  { line: 14, highlight: "# petstore_api doesn't provide it" },
]

const REPORT_COMMAND =
  'bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production'
const REPORT_HEADLINE = 'petstore_web 2.3.0 cannot be deployed to production'
const REPORT_BODY: Array<string> = [
  '',
  'petstore_api (1.4.0, deployed):',
  '  GET /pets/*',
  '    response 200:',
  '      - petstore_web reads "$.status", but petstore_api doesn\'t provide it → stop reading it, or mark it optional',
  '      - petstore_web reads "$.weight" as string, but petstore_api provides integer → read it as integer',
]

const TONE_CLASS: Record<ContractTone, string | undefined> = {
  key: 'text-secondary',
  colon: 'text-muted',
  value: 'text-primary',
  plain: undefined,
  failure: 'text-failure',
}

export function ContractsComparison() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 md:px-6 md:py-12">
        <div className={`${GRID} items-end`}>
          <div>
            <Eyebrow className="mb-3">── two contracts, one comparison</Eyebrow>
            <p className={PROSE}>{INTRO_LEFT}</p>
          </div>
          <p className={PROSE}>{INTRO_RIGHT}</p>
        </div>
        <div className={GRID}>
          <ContractPane
            title="provider · petstore_api"
            yaml={PROVIDER_YAML}
            highlights={PROVIDER_HIGHLIGHTS}
            status="produces · extra fields are free"
          />
          <ContractPane
            title="consumer · petstore_web"
            yaml={CONSUMER_YAML}
            highlights={CONSUMER_HIGHLIGHTS}
            status={
              <>
                reads · every required property is a check ·{' '}
                <span className="text-secondary">2.3.0</span>
              </>
            }
          />
        </div>
        <Pane bodyClassName="px-4 py-3 text-[13px] leading-[1.6] whitespace-pre-wrap [overflow-wrap:anywhere]">
          <div>
            <span className="text-accent">$ </span>
            <span className="text-primary">{REPORT_COMMAND}</span>
          </div>
          <div className="text-failure">{REPORT_HEADLINE}</div>
          {REPORT_BODY.map((line, index) => (
            <div key={index} className="min-h-[1.6em]">
              {line}
            </div>
          ))}
        </Pane>
      </div>
    </section>
  )
}

type ContractPaneProps = {
  title: string
  yaml: string
  highlights: Array<Highlight>
  status: ReactNode
}

function ContractPane({ title, yaml, highlights, status }: ContractPaneProps) {
  const lines = yaml.split('\n')
  return (
    <Pane
      title={title}
      titleRight="contract.yaml"
      status={status}
      className="flex-1"
      bodyClassName="flex-1"
    >
      <pre className="text-[12px] leading-[1.6] whitespace-pre-wrap [overflow-wrap:anywhere]">
        {lines.map((line, index) => (
          <span key={index} className="block">
            {contractLine(line, highlights, index).map((segment, position) => (
              <span key={position} className={TONE_CLASS[segment.tone]}>
                {segment.text}
              </span>
            ))}
          </span>
        ))}
      </pre>
    </Pane>
  )
}

function contractLine(
  line: string,
  highlights: Array<Highlight>,
  index: number,
): Array<Segment<ContractTone>> {
  const segments = yamlLine(line)
  const marked = highlights.find((candidate) => candidate.line === index)
  if (marked === undefined) return segments
  return segments.flatMap((segment) =>
    splitHighlight(segment, marked.highlight),
  )
}

function splitHighlight(
  segment: Segment<YamlTone>,
  highlight: string,
): Array<Segment<ContractTone>> {
  if (segment.tone !== 'value') return [segment]
  const start = segment.text.indexOf(highlight)
  if (start === -1) return [segment]
  const end = start + highlight.length
  const parts: Array<Segment<ContractTone>> = [
    { text: segment.text.slice(0, start), tone: 'value' },
    { text: highlight, tone: 'failure' },
    { text: segment.text.slice(end), tone: 'value' },
  ]
  return parts.filter((part) => part.text !== '')
}
