import { CopyCommand } from '../CopyCommand'
import { SectionHeading } from '../SectionHeading'

const TRY_COMMAND = 'curl -sL bidirekt.com/try | sh'
const SCRIPT_URL = 'https://github.com/bidirekt/site/blob/main/public/try'
const CLONE_COMMAND = 'git clone https://github.com/bidirekt/petstore-example'
const RUN_COMMAND = 'cd petstore-example && ./try.sh'

export function TryIt() {
  return (
    <section
      id="try"
      aria-labelledby="try-title"
      className="py-16 min-[721px]:py-24"
    >
      <SectionHeading
        id="try-title"
        title="See it catch a break on your machine"
        lede="One command sets up the petstore example with Docker and walks you through a breaking change and its fix."
      />
      <CopyCommand command={TRY_COMMAND} className="text-[16px]" />
      <p className="mt-7 mb-2 text-[14px] text-muted">
        Prefer not to pipe to sh?{' '}
        <a
          href={SCRIPT_URL}
          className="pressable text-[15px] text-secondary hover:text-accent"
        >
          Read the script
        </a>
        , or:
      </p>
      <pre className="overflow-x-auto rounded-[8px] bg-pane px-4 py-3.5 font-mono text-[14px] leading-[1.8] whitespace-pre text-secondary">
        <span className="text-accent">$</span> {CLONE_COMMAND}
        {'\n'}
        <span className="text-accent">$</span> {RUN_COMMAND}
      </pre>
    </section>
  )
}
