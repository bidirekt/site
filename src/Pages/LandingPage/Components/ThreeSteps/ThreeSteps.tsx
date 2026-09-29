import { Fragment } from 'react'
import { Pane } from '#/Components/Pane'

type Step = {
  title: string
  text: string
  commandLines: Array<string>
  success: string
}

const STEPS: Array<Step> = [
  {
    title: '1 · publish',
    text: 'Each participant declares what it provides and what it consumes in one YAML file, and publishes it under a version.',
    commandLines: [
      'bidirekt publish ./contracts/*.yaml',
      '--participant petstore_api --version 1.5.0',
    ],
    success: 'petstore_api contract publish successful',
  },
  {
    title: '2 · can-i-deploy',
    text: 'Ask before you deploy. The broker compares the new version against what is deployed; the exit code is the gate in CI.',
    commandLines: [
      'bidirekt can-i-deploy petstore_api',
      '--version 1.5.0 --environment production',
    ],
    success: 'petstore_api can be deployed to production',
  },
  {
    title: '3 · record-deployment',
    text: 'After the deploy succeeds, tell the broker which version now runs where. That is the state the next check compares against.',
    commandLines: [
      'bidirekt record-deployment petstore_api',
      '--version 1.5.0 --environment production',
    ],
    success: 'petstore_api deployment recorded to production',
  },
]

export function ThreeSteps() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1040px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 px-4 py-8 md:px-6 md:py-12">
        {STEPS.map((step) => (
          <Pane
            key={step.title}
            title={step.title}
            bodyClassName="flex flex-1 flex-col gap-3"
          >
            <p className="text-[13px] leading-[1.7] text-secondary text-pretty">
              {step.text}
            </p>
            <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3 text-[12px] leading-[1.6] text-secondary">
              <div className="grid grid-cols-[max-content_1fr] gap-2">
                <span className="text-accent">$</span>
                <span className="[overflow-wrap:anywhere]">
                  {step.commandLines.map((line, index) => (
                    <Fragment key={line}>
                      {index > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </span>
              </div>
              <div className="text-success">{step.success}</div>
            </div>
          </Pane>
        ))}
      </div>
    </section>
  )
}
