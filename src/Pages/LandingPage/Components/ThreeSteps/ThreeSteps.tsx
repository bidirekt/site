type Step = { number: number; command: string; text: string }

const STEPS: Array<Step> = [
  {
    number: 1,
    command: 'publish',
    text: 'Each participant declares what it provides and what it consumes in one YAML file, and publishes it under a version.',
  },
  {
    number: 2,
    command: 'can-i-deploy',
    text: 'Ask before you deploy. The broker compares the new version against what is deployed; the exit code is the gate in CI.',
  },
  {
    number: 3,
    command: 'record-deployment',
    text: 'After the deploy succeeds, tell the broker which version now runs where. That is the state the next check compares against.',
  },
]

export function ThreeSteps() {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3.5 pt-14">
      {STEPS.map((step) => (
        <div
          key={step.command}
          className="flex flex-col gap-2.5 border border-[#262626] bg-pane px-[18px] pt-5 pb-[22px]"
        >
          <div className="text-[13px] text-[#6a6a6a]">
            {step.number} · <span className="text-primary">{step.command}</span>
          </div>
          <p className="text-[13px] leading-[1.7] text-secondary">
            {step.text}
          </p>
        </div>
      ))}
    </section>
  )
}
