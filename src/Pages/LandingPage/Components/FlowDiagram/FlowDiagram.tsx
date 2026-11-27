import { useEffect, useId, useState } from 'react'
import { tv } from 'tailwind-variants'
import { PHASES } from './phases'
import type { Phase, Verdict } from './phases'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

type Box = { x: number; y: number; w: number; h: number }
type Point = { x: number; y: number }
type Layout = {
  viewBox: string
  api: Box
  web: Box
  broker: Box
  production: Box
  apiWire: string
  webWire: string
  deployWire: string
  publishLabel: Point
  contractLabel: Point
  deployLabel: Point
  splitDetails: boolean
}

const WIDE: Layout = {
  viewBox: '0 0 1060 380',
  api: { x: 20, y: 45, w: 242, h: 100 },
  web: { x: 20, y: 235, w: 242, h: 100 },
  broker: { x: 410, y: 120, w: 240, h: 140 },
  production: { x: 800, y: 130, w: 240, h: 120 },
  apiWire: 'M262 95 C 330 95, 340 190, 408 190',
  webWire: 'M262 285 C 330 285, 340 190, 408 190',
  deployWire: 'M650 190 L 796 190',
  publishLabel: { x: 278, y: 80 },
  contractLabel: { x: 278, y: 314 },
  deployLabel: { x: 668, y: 176 },
  splitDetails: false,
}

const TALL: Layout = {
  viewBox: '0 0 360 630',
  api: { x: 8, y: 8, w: 168, h: 118 },
  web: { x: 184, y: 8, w: 168, h: 118 },
  broker: { x: 50, y: 220, w: 260, h: 140 },
  production: { x: 50, y: 490, w: 260, h: 120 },
  apiWire: 'M92 126 C 92 174, 180 170, 180 218',
  webWire: 'M268 126 C 268 174, 180 170, 180 218',
  deployWire: 'M180 360 L 180 486',
  publishLabel: { x: 20, y: 172 },
  contractLabel: { x: 280, y: 172 },
  deployLabel: { x: 192, y: 428 },
  splitDetails: true,
}

const box = tv({
  base: 'fill-pane stroke-1 transition-[stroke] duration-300 motion-reduce:transition-none',
  variants: {
    tone: {
      neutral: 'stroke-white/14',
      no: 'stroke-failure',
      yes: 'stroke-success',
    },
  },
})

const flow = tv({
  base: 'fill-none stroke-[1.75] [stroke-dasharray:6_8] [stroke-linecap:round] transition-opacity duration-300 motion-reduce:animate-none',
  variants: {
    state: {
      off: 'opacity-0',
      still: 'opacity-100',
      moving: 'animate-dash opacity-100',
    },
  },
})

const KICKER = 'fill-muted font-mono text-[12px]'
const TITLE =
  'fill-primary font-display text-[19px] font-semibold tracking-[-0.02em]'
const DETAIL = 'fill-primary font-mono text-[12px] font-medium'
const LABEL = 'fill-muted font-mono text-[12px]'

export function FlowDiagram() {
  const [phaseIndex, setPhaseIndex] = useState(PHASES.length - 1)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return
    setAnimated(true)
    setPhaseIndex(0)
  }, [])

  useEffect(() => {
    if (!animated) return
    const timer = setTimeout(
      () => setPhaseIndex((phaseIndex + 1) % PHASES.length),
      PHASES[phaseIndex].durationMs,
    )
    return () => clearTimeout(timer)
  }, [animated, phaseIndex])

  const phase = PHASES[phaseIndex]

  return (
    <div className="rounded-pane border border-line bg-pane p-6 shadow-sheen max-[720px]:p-4">
      <Diagram layout={WIDE} phase={phase} className="max-[720px]:hidden" />
      <Diagram
        layout={TALL}
        phase={phase}
        className="mx-auto max-w-[380px] min-[721px]:hidden"
      />
      <div
        aria-live="polite"
        className="mt-4 min-h-[3.5em] font-mono text-[13px] leading-[1.75] whitespace-pre-wrap text-secondary [overflow-wrap:anywhere]"
      >
        {phase.output.map((line) => (
          <div key={line.text} className={outputTone(line.tone)}>
            {line.text}
          </div>
        ))}
      </div>
      <div
        role="group"
        aria-label="Steps"
        className="mt-4 flex flex-wrap gap-x-5 gap-y-2"
      >
        {PHASES.map((step, index) => (
          <button
            key={step.label}
            type="button"
            aria-pressed={index === phaseIndex}
            onClick={() => setPhaseIndex(index)}
            className="pressable cursor-pointer text-[13.5px] font-medium text-muted hover:text-primary aria-pressed:text-primary"
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>
    </div>
  )
}

type DiagramProps = { layout: Layout; phase: Phase; className: string }

function Diagram({ layout, phase, className }: DiagramProps) {
  const head = `${useId()}-head`
  return (
    <svg
      viewBox={layout.viewBox}
      role="img"
      aria-label="petstore_api and petstore_web publish their contracts to the Bidirekt broker. can-i-deploy answers no for petstore_api 2.0.0, which drops Pet.status, and yes for 3.0.0, which CI then deploys to production."
      className={`block h-auto w-full ${className}`}
    >
      <defs>
        <Arrowhead id={head} />
      </defs>
      {[layout.apiWire, layout.webWire, layout.deployWire].map((wire) => (
        <path
          key={wire}
          d={wire}
          markerEnd={`url(#${head})`}
          className="fill-none stroke-edge stroke-[1.5]"
        />
      ))}
      <path
        d={layout.apiWire}
        className={`${flow({ state: publishState(phase, 'api') })} stroke-primary`}
      />
      <path
        d={layout.webWire}
        className={`${flow({ state: publishState(phase, 'web') })} stroke-primary`}
      />
      <path
        d={layout.deployWire}
        className={`${flow({ state: deployState(phase) })} ${deployStroke(phase)}`}
      />
      <Node
        box={layout.api}
        split={layout.splitDetails}
        tone="neutral"
        kicker="provides"
        title="petstore_api"
        details={[phase.apiVersion]}
      />
      <Node
        box={layout.web}
        split={layout.splitDetails}
        tone="neutral"
        kicker="consumes · deployed"
        title="petstore_web"
        details={['1.0.0 · reads Pet.status']}
      />
      <Node
        box={layout.broker}
        tone={phase.verdict}
        kicker="self-hosted"
        title="Bidirekt broker"
        details={[phase.brokerStatus]}
        badge={phase.verdict}
      />
      <Node
        box={layout.production}
        tone={productionTone(phase)}
        kicker="environment"
        title="production"
        details={[phase.productionApi, 'petstore_web 1.0.0']}
      />
      <text
        x={layout.publishLabel.x}
        y={layout.publishLabel.y}
        className={LABEL}
      >
        publish
      </text>
      <text
        x={layout.contractLabel.x}
        y={layout.contractLabel.y}
        className={LABEL}
      >
        contract
      </text>
      <text
        x={layout.deployLabel.x}
        y={layout.deployLabel.y}
        className={`font-mono text-[12px] ${deployLabelTone(phase)}`}
      >
        {deployLabel(phase)}
      </text>
    </svg>
  )
}

type NodeProps = {
  box: Box
  tone: 'neutral' | Verdict
  kicker: string
  title: string
  details: Array<string>
  badge?: Verdict
  split?: boolean
}

function Node({
  box: b,
  tone,
  kicker,
  title,
  details,
  badge,
  split = false,
}: NodeProps) {
  const lines = splitLines(details, split)
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={12}
        className={box({ tone: boxTone(tone) })}
      />
      <text x={b.x + 18} y={b.y + 28} className={KICKER}>
        {kicker}
      </text>
      <text x={b.x + 18} y={b.y + 55} className={TITLE}>
        {title}
      </text>
      {lines.map((detail, index) => (
        <text
          key={detail}
          x={b.x + 18}
          y={b.y + 80 + index * 22}
          className={detailTone(index)}
        >
          {detail}
        </text>
      ))}
      {badge !== undefined && badge !== 'pending' && (
        <Badge x={b.x + 18} y={b.y + 100} verdict={badge} />
      )}
    </g>
  )
}

function Badge({
  x,
  y,
  verdict,
}: {
  x: number
  y: number
  verdict: 'no' | 'yes'
}) {
  const text = `can-i-deploy: ${verdict}`
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={text.length * 7.3 + 24}
        height={24}
        rx={12}
        className={badgeFill(verdict)}
      />
      <text
        x={x + 12}
        y={y + 16}
        className={`font-mono text-[12px] font-medium ${badgeText(verdict)}`}
      >
        {text}
      </text>
    </g>
  )
}

function Arrowhead({ id }: { id: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto"
    >
      <path
        d="M1 1 9 5 1 9"
        fill="none"
        strokeWidth="1.5"
        className="stroke-muted"
      />
    </marker>
  )
}

function publishState(phase: Phase, side: 'api' | 'web'): 'off' | 'moving' {
  if (phase.publishing.includes(side)) return 'moving'
  return 'off'
}

function deployState(phase: Phase): 'off' | 'still' | 'moving' {
  if (phase.deploying) return 'moving'
  if (phase.verdict === 'no') return 'still'
  return 'off'
}

function boxTone(tone: 'neutral' | Verdict): 'neutral' | 'no' | 'yes' {
  if (tone === 'pending') return 'neutral'
  return tone
}

function productionTone(phase: Phase): 'neutral' | 'yes' {
  if (phase.deploying) return 'yes'
  return 'neutral'
}

function deployStroke(phase: Phase): string {
  if (phase.verdict === 'no') return 'stroke-failure'
  return 'stroke-success'
}

function deployLabel(phase: Phase): string {
  if (phase.verdict === 'no') return 'CI stops the deploy'
  return 'deploy'
}

function deployLabelTone(phase: Phase): string {
  if (phase.verdict === 'no') return 'fill-failure'
  if (phase.verdict === 'yes') return 'fill-success'
  return 'fill-muted'
}

function detailTone(index: number): string {
  if (index === 0) return DETAIL
  return 'fill-muted font-mono text-[12px]'
}

function badgeFill(verdict: 'no' | 'yes'): string {
  if (verdict === 'no') return 'fill-failure-bg'
  return 'fill-success/12'
}

function badgeText(verdict: 'no' | 'yes'): string {
  if (verdict === 'no') return 'fill-failure'
  return 'fill-success'
}

function outputTone(tone: 'failed' | 'passed' | undefined): string {
  if (tone === 'failed') return 'text-failure'
  if (tone === 'passed') return 'text-success'
  return ''
}

function splitLines(details: Array<string>, split: boolean): Array<string> {
  if (!split) return details
  return details.flatMap((detail) => detail.split(' · '))
}
