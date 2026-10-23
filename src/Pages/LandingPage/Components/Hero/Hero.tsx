import { CopyCommand } from '../CopyCommand'

const TRY_COMMAND = 'curl -sL bidirekt.com/try | sh'
const FINEPRINT =
  'Runs the petstore example locally with Docker. Self-hosted broker, single Go binary.'

const RISE = 'animate-rise motion-reduce:animate-none'

export function Hero() {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] justify-items-center gap-[22px] pt-14 pb-8 text-center min-[721px]:pt-[104px] min-[721px]:pb-12">
      <h1
        className={`text-[clamp(44px,7.4vw,88px)] leading-none font-semibold tracking-[-0.045em] text-balance ink-gradient ${RISE}`}
      >
        Know before you deploy.
      </h1>
      <p
        className={`max-w-[58ch] text-[17px] text-pretty text-secondary min-[721px]:text-[18px] ${RISE} [animation-delay:70ms]`}
      >
        Integration testing for microservices, without the test environment.
        Each service declares, in a YAML file, what it provides and what it
        reads. Bidirekt compares the files and tells you{' '}
        <strong className="font-medium text-primary">
          which service your deploy breaks and how to fix it
        </strong>
        . No running services, no end-to-end suite.
      </p>
      <div
        className={`mt-2 flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 ${RISE} [animation-delay:140ms]`}
      >
        <CopyCommand command={TRY_COMMAND} lit />
        <a
          href="/docs"
          className="pressable text-[15px] text-secondary hover:text-accent"
        >
          Read the docs →
        </a>
      </div>
      <p className={`text-[14px] text-muted ${RISE} [animation-delay:210ms]`}>
        {FINEPRINT}
      </p>
    </section>
  )
}
