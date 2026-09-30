import { useEffect, useState } from 'react'

export type HandshakePhase =
  'approach' | 'overlap' | 'shake' | 'success' | 'hold' | 'reset'
type Glow = 'none' | 'amber' | 'green'
type Caption = '[ can-i-deploy ? ]' | '[ deployable ]'
type ShakeStep = 0 | 1
export type HandshakeFrame = {
  phase: HandshakePhase
  leftX: number
  rightX: number
  shakeStep: ShakeStep
  glow: Glow
  caption: Caption
}

const TICK_MS = 100
const PHASES: Array<{ phase: HandshakePhase; ticks: number }> = [
  { phase: 'approach', ticks: 12 },
  { phase: 'overlap', ticks: 3 },
  { phase: 'shake', ticks: 15 },
  { phase: 'success', ticks: 5 },
  { phase: 'hold', ticks: 20 },
  { phase: 'reset', ticks: 3 },
]
const CYCLE_TICKS = PHASES.reduce((sum, entry) => sum + entry.ticks, 0)
const CELL_PX = 7.8
const STAGE_CELLS = 44
const STAGE_WIDTH_PX = STAGE_CELLS * CELL_PX
const STAGE_MID_PX = STAGE_WIDTH_PX / 2
const HAND_PX = 112
const GAP_MAX_CELLS = 14
const OVERLAP_PX = 36

const AMBER_GLOW = 'drop-shadow(0 0 6px #F5A52488)'
const GREEN_GLOW = 'drop-shadow(0 0 6px #3FB95088)'
const GLOW_FILTER: Record<Glow, string> = {
  none: 'none',
  amber: AMBER_GLOW,
  green: GREEN_GLOW,
}
const SHAKE_TRANSFORM: Record<ShakeStep, string> = {
  0: 'translate(2px, -2px) rotate(2deg)',
  1: 'translate(-2px, 2px) rotate(-2deg)',
}
const CLASPED: Record<HandshakePhase, boolean> = {
  approach: false,
  overlap: false,
  shake: true,
  success: true,
  hold: true,
  reset: false,
}
const GLOW_BY_PHASE: Record<HandshakePhase, Glow> = {
  approach: 'none',
  overlap: 'none',
  shake: 'amber',
  success: 'green',
  hold: 'green',
  reset: 'none',
}
const CAPTION_BY_PHASE: Record<HandshakePhase, Caption> = {
  approach: '[ can-i-deploy ? ]',
  overlap: '[ can-i-deploy ? ]',
  shake: '[ can-i-deploy ? ]',
  success: '[ deployable ]',
  hold: '[ deployable ]',
  reset: '[ can-i-deploy ? ]',
}

const HAND =
  'absolute top-1 text-[112px] leading-none transition-[left] duration-100 ease-linear'
const CLASP =
  'absolute top-1 text-[112px] leading-none transition-transform duration-100 ease-in-out'
const BLANK_ROW = 'h-[1.45em]'

export function handshakeFrame(tick: number): HandshakeFrame {
  const { phase, offset, ticks } = phaseAt(tick % CYCLE_TICKS)
  const gapCells = gapAt(phase, offset, ticks)
  const overlapPx = overlapAt(phase, offset, ticks)
  const halfGapPx = (gapCells * CELL_PX) / 2
  const shakeStep = shakeStepAt(offset)
  const glow = GLOW_BY_PHASE[phase]
  const caption = CAPTION_BY_PHASE[phase]
  if (CLASPED[phase]) {
    const claspX = STAGE_MID_PX - HAND_PX / 2
    return { phase, leftX: claspX, rightX: claspX, shakeStep, glow, caption }
  }
  return {
    phase,
    leftX: STAGE_MID_PX - HAND_PX - halfGapPx + overlapPx,
    rightX: STAGE_MID_PX + halfGapPx - overlapPx,
    shakeStep,
    glow,
    caption,
  }
}

function phaseAt(cycleTick: number) {
  let offset = cycleTick
  for (const { phase, ticks } of PHASES) {
    if (offset < ticks) return { phase, offset, ticks }
    offset -= ticks
  }
  throw new Error(`tick ${cycleTick} outside the ${CYCLE_TICKS}-tick cycle`)
}

function gapAt(phase: HandshakePhase, offset: number, ticks: number): number {
  if (phase === 'approach') {
    return Math.round(GAP_MAX_CELLS * (1 - offset / ticks))
  }
  if (phase === 'reset') return GAP_MAX_CELLS
  return 0
}

function overlapAt(
  phase: HandshakePhase,
  offset: number,
  ticks: number,
): number {
  if (phase !== 'overlap') return 0
  return OVERLAP_PX * Math.min(1, (offset + 1) / ticks)
}

function shakeStepAt(offset: number): ShakeStep {
  if (offset % 2 === 1) return 1
  return 0
}

function shakeTransform(frame: HandshakeFrame): string {
  if (frame.phase !== 'shake') return 'none'
  return SHAKE_TRANSFORM[frame.shakeStep]
}

type HandshakePaneProps = { className?: string }

export function HandshakePane({ className }: HandshakePaneProps) {
  const [tick, setTick] = useState(0)
  const frame = handshakeFrame(tick)
  const filter = GLOW_FILTER[frame.glow]

  useEffect(() => {
    const interval = setInterval(
      () => setTick((current) => current + 1),
      TICK_MS,
    )
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`max-w-full overflow-hidden p-4 text-[13px] leading-[1.45] ${className ?? ''}`}
    >
      <div className="mx-auto max-w-full" style={{ width: STAGE_WIDTH_PX }}>
        <div className="flex justify-between text-[12px] whitespace-pre text-muted">
          <span>provider</span>
          <span>consumer</span>
        </div>
        <div className={BLANK_ROW} />
        <div
          className="relative h-[124px] max-w-full"
          style={{ width: STAGE_WIDTH_PX }}
        >
          {CLASPED[frame.phase] && (
            <span
              className={CLASP}
              style={{
                left: frame.leftX,
                filter,
                transform: shakeTransform(frame),
              }}
            >
              🤝
            </span>
          )}
          {!CLASPED[frame.phase] && (
            <>
              <span
                className={`${HAND} z-10`}
                style={{ left: frame.leftX, filter }}
              >
                🫱
              </span>
              <span className={HAND} style={{ left: frame.rightX, filter }}>
                🫲
              </span>
            </>
          )}
        </div>
        <div className={BLANK_ROW} />
        <div className={`text-center whitespace-pre ${captionClass(frame)}`}>
          {frame.caption}
        </div>
      </div>
    </div>
  )
}

function captionClass(frame: HandshakeFrame): string {
  if (frame.caption === '[ deployable ]') return 'text-success'
  return 'text-muted'
}
