import { Eyebrow } from '#/Components/Eyebrow'
import { CopyCommand } from '../CopyCommand'

const TRY_COMMAND = 'curl -sL bidirekt.com/try | sh'
const SCRIPT_URL = '/try'
const CLONE_COMMAND = 'git clone https://github.com/bidirekt/petstore-example'
const RUN_COMMAND = 'cd petstore-example && docker compose up'

export function TryIt() {
  return (
    <section id="try" className="flex flex-col gap-5 pt-[88px]">
      <Eyebrow>try it</Eyebrow>
      <p className="max-w-[620px] leading-[1.75] text-secondary">
        See a breaking change caught in one command. Runs the petstore example
        locally with Docker.
      </p>
      <div className="flex flex-wrap items-stretch gap-x-4 gap-y-2.5">
        <CopyCommand command={TRY_COMMAND} className="flex-[1_1_420px]" />
        <a
          href={SCRIPT_URL}
          className="pressable self-center text-[13px] text-secondary hover:text-accent"
        >
          [ view script ]
        </a>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[12px] text-muted">or, without curl | sh:</div>
        <pre className="overflow-x-auto rounded-pane border border-dashed border-line px-4 py-3 text-[13px] leading-[1.7] text-secondary">
          <span className="text-accent">$</span> {CLONE_COMMAND}
          {'\n'}
          <span className="text-accent">$</span> {RUN_COMMAND}
        </pre>
      </div>
    </section>
  )
}
