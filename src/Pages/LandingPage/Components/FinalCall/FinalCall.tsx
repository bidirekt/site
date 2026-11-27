import { Arrow } from '#/Components/Arrow'
import { CopyCommand } from '../CopyCommand'

const DEMO_COMMAND = 'curl -sL bidirekt.com/demo | sh'

export function FinalCall() {
  return (
    <section
      aria-labelledby="final-title"
      className="grid justify-items-center gap-5 py-20 text-center min-[721px]:py-28"
    >
      <h2
        id="final-title"
        className="max-w-[18ch] font-display text-[clamp(32px,4.6vw,52px)] leading-[1.05] font-bold tracking-[-0.035em] text-balance"
      >
        See it catch a break before your next deploy
      </h2>
      <div className="grid w-full max-w-[560px] justify-items-center gap-3">
        <CopyCommand command={DEMO_COMMAND} className="w-full text-[15px]" />
        <p className="text-[15px] text-secondary">
          Then point it at your own services:{' '}
          <a
            href="/docs/start/try"
            className="pressable text-primary underline decoration-muted underline-offset-[3px] hover:decoration-primary"
          >
            Try on your project
            <Arrow direction="right" />
          </a>
        </p>
      </div>
    </section>
  )
}
