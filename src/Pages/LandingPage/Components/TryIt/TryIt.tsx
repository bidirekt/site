import type { ReactNode } from 'react'
import { Arrow } from '#/Components/Arrow'
import { CopyCommand } from '../CopyCommand'
import { SectionHeading } from '../SectionHeading'

const DEMO_COMMAND = 'curl -sL bidirekt.com/demo | sh'
const DEMO_SCRIPT_URL = 'https://github.com/bidirekt/site/blob/main/public/demo'
const CLONE_COMMAND = 'git clone https://github.com/bidirekt/petstore-example'
const RUN_COMMAND = 'cd petstore-example && ./demo.sh'
const TRY_COMMAND = 'curl -sL bidirekt.com/try | sh'
const TRY_SCRIPT_URL = 'https://github.com/bidirekt/site/blob/main/public/try'
const TRY_DOCS_URL = '/docs/start/try'

const LINK =
  'pressable text-[14px] text-secondary underline decoration-muted underline-offset-[3px] hover:text-primary hover:decoration-primary'

export function TryIt() {
  return (
    <section
      id="try"
      aria-labelledby="try-title"
      className="scroll-mt-20 py-16 min-[721px]:py-24"
    >
      <SectionHeading
        id="try-title"
        title="Try it on your machine"
        lede="Start with the demo to see a break caught, then set Bidirekt up next to your own services. The broker runs with Docker."
      />
      <div className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-[minmax(0,1fr)]">
        <Path
          title="See a break: the petstore demo"
          body={
            <>
              Runs the petstore example with Docker: a breaking change,{' '}
              <code className="whitespace-nowrap">can-i-deploy</code> catching
              it, and the fix, step by step.
            </>
          }
          command={DEMO_COMMAND}
          footer={
            <>
              <p className="text-[14px] text-muted">
                Prefer not to pipe to sh?{' '}
                <a href={DEMO_SCRIPT_URL} className={LINK}>
                  Read the script
                </a>
                , or:
              </p>
              <pre className="rounded-[10px] border border-line bg-pane px-4 py-3 font-mono text-[13px] leading-[1.8] whitespace-pre-wrap text-secondary [overflow-wrap:anywhere]">
                <span className="text-muted">$</span> {CLONE_COMMAND}
                {'\n'}
                <span className="text-muted">$</span> {RUN_COMMAND}
              </pre>
            </>
          }
        />
        <Path
          title="Set up on your services"
          body={
            <>
              Sets up Bidirekt in the current folder: the broker&apos;s compose
              file in <code>bidirekt/</code>, the <code>bidirekt</code> CLI and
              the agent skill. Then follow the guide to publish your first
              contracts.
            </>
          }
          command={TRY_COMMAND}
          footer={
            <p className="flex flex-wrap gap-x-5 gap-y-2">
              <a href={TRY_SCRIPT_URL} className={LINK}>
                Read the script
              </a>
              <a href={TRY_DOCS_URL} className={LINK}>
                Try on your project
                <Arrow direction="right" />
              </a>
            </p>
          }
        />
      </div>
    </section>
  )
}

type PathProps = {
  title: string
  body: ReactNode
  command: string
  footer: ReactNode
}

function Path({ title, body, command, footer }: PathProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-pane border border-line bg-page p-5 min-[721px]:p-6">
      <h3 className="font-display text-[22px] leading-[1.25] font-semibold tracking-[-0.02em]">
        {title}
      </h3>
      <p className="text-[15px] text-secondary">{body}</p>
      <CopyCommand command={command} className="w-full" />
      <div className="mt-auto grid gap-2">{footer}</div>
    </div>
  )
}
