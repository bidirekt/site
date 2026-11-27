import { Arrow } from '#/Components/Arrow'
import { DemoTerminal } from '../DemoTerminal'
import { CopyCommand } from '../CopyCommand'

const DEMO_COMMAND = 'curl -sL bidirekt.com/demo | sh'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="grid grid-cols-[minmax(0,1fr)] justify-items-center gap-6 pt-16 pb-16 text-center min-[721px]:pt-28 min-[721px]:pb-24"
    >
      <h1
        id="hero-title"
        className="max-w-[14ch] font-display text-[clamp(44px,7.4vw,92px)] leading-[0.95] font-bold tracking-[-0.04em] text-balance text-primary"
      >
        Know which service your deploy breaks
      </h1>
      <p className="max-w-[62ch] text-[17px] text-pretty text-secondary min-[721px]:text-[19px]">
        Integration testing for microservices, without the test environment.
        Each service declares what it provides and what it reads;{' '}
        <code className="whitespace-nowrap text-primary">can-i-deploy</code>{' '}
        compares the declarations before the deploy and{' '}
        <strong className="font-medium text-primary">
          names the field, the side and the fix
        </strong>
        . Nothing runs. Works with REST and GraphQL.
      </p>
      <div className="mt-2 grid w-full max-w-[560px] justify-items-center gap-3">
        <CopyCommand command={DEMO_COMMAND} className="w-full text-[15px]" />
        <p className="text-[14px] text-muted">
          Runs the petstore demo with Docker: a breaking change, can-i-deploy
          catching it, and the fix.
        </p>
        <a
          href="/docs"
          className="pressable text-[15px] text-secondary hover:text-primary"
        >
          Read the docs
          <Arrow direction="right" />
        </a>
      </div>
      <div className="mt-10 w-full max-w-[1120px]">
        <DemoTerminal />
        <p className="mt-3 text-[13px] text-muted">
          Output of the petstore demo. The deploy and record-deployment lines
          are the next step in CI.
        </p>
      </div>
    </section>
  )
}
