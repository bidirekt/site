import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { Player } from 'asciinema-player'
import landingScreen from '../../../../../public/casts/landing.cast?screen'

const CAST_URL = '/casts/landing.cast'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const LINE_HEIGHT = 1.3333333333
const PLAYER_OPTIONS = {
  controls: true,
  idleTimeLimit: 1.5,
  theme: 'bidirekt',
  terminalFontFamily: 'var(--font-mono)',
  terminalLineHeight: LINE_HEIGHT,
}
// asciinema-player fits the terminal to the box width: cols × 0.6em of
// JetBrains Mono plus a 0.75em border, with its 32px control bar below. The
// screen text takes that same box until the player mounts.
const SCREEN_STYLE = {
  fontSize: `calc(100cqw / ${landingScreen.cols * 0.6 + 1.5})`,
  lineHeight: LINE_HEIGHT,
}
const SCREEN =
  'overflow-hidden p-[0.75em] pb-[calc(0.75em+32px)] [font-variant-ligatures:none] [grid-area:1/1]'
const DOT = 'size-[11px] rounded-full'

export function TerminalPane() {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerMounted = usePlayerInView(playerRef)

  return (
    <section aria-label="Terminal demo" className="hidden pb-[88px] md:block">
      <div className="min-w-0 overflow-hidden rounded-pane border border-line bg-pane shadow-[inset_0_1px_0_var(--color-sheen),0_20px_50px_rgba(0,0,0,0.55)]">
        <div
          className="flex gap-[7px] border-b border-line bg-raised px-3.5 py-2.5"
          aria-hidden="true"
        >
          <span className={`${DOT} bg-[#3a3a3a]`} />
          <span className={`${DOT} bg-[#3a3a3a]`} />
          <span className={`${DOT} bg-accent`} />
        </div>
        <div className="@container grid">
          <pre style={SCREEN_STYLE} className={screenClass(playerMounted)}>
            {landingScreen.lines.join('\n')}
          </pre>
          <div ref={playerRef} className="[grid-area:1/1]" />
        </div>
      </div>
    </section>
  )
}

function screenClass(playerMounted: boolean): string {
  if (playerMounted) return `${SCREEN} invisible`
  return SCREEN
}

function usePlayerInView(ref: RefObject<HTMLDivElement | null>): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null) return
    let player: Player | undefined
    let unmounted = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        void import('asciinema-player').then(({ create }) => {
          if (unmounted) return
          const reducedMotion = window.matchMedia(REDUCED_MOTION).matches
          player = create(CAST_URL, element, {
            ...PLAYER_OPTIONS,
            autoPlay: !reducedMotion,
            loop: !reducedMotion,
          })
          if (reducedMotion) void player.seek('100%')
          setMounted(true)
        })
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => {
      unmounted = true
      observer.disconnect()
      player?.dispose()
    }
  }, [ref])

  return mounted
}
