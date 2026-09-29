import { Button } from '#/Components/Button'
import { Eyebrow } from '#/Components/Eyebrow'
import { HandshakePane } from '../HandshakePane'
import { TerminalPane } from '../TerminalPane'

const GITHUB_URL = 'https://github.com/bidirekt'
const EYEBROW = '── declarative · static · bidirectional contract testing.'
const HEADLINE = 'Catch the breaking change before it reaches production.'
const PITCH_BEFORE_CODE =
  'Both sides declare what they provide and what they consume in one YAML file. The broker compares the declarations against what is deployed and answers '
const PITCH_CODE = 'can-i-deploy'
const PITCH_AFTER_CODE = ', property by property. Nothing has to be running.'

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-12 pb-8 md:px-6 md:pt-24 md:pb-16">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 md:grid-cols-[minmax(0,1fr)_max-content]">
        <div className="min-w-0">
          <Eyebrow className="mb-6">{EYEBROW}</Eyebrow>
          <h1 className="mb-6 max-w-[22ch] text-[24px] leading-[1.15] font-medium tracking-[-0.01em] text-pretty md:text-[40px]">
            {HEADLINE}
          </h1>
          <p className="mb-8 max-w-[64ch] text-[14px] leading-[1.7] text-secondary text-pretty">
            {PITCH_BEFORE_CODE}
            <code className="text-primary">{PITCH_CODE}</code>
            {PITCH_AFTER_CODE}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" href="/docs">
              [ read the docs ]
            </Button>
            <Button href={GITHUB_URL}>[ github ↗ ]</Button>
          </div>
        </div>
        <HandshakePane className="md:self-center md:justify-self-end" />
      </div>
      <TerminalPane className="mt-12" />
    </section>
  )
}
