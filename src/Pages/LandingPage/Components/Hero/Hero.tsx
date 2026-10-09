import { Eyebrow } from '#/Components/Eyebrow'
import { HandshakePane } from '../HandshakePane'

const GITHUB_URL = 'https://github.com/bidirekt'
const EYEBROW = 'declarative · static · bidirectional contract testing'
const HEADLINE =
  'Know if your deploy breaks another service, before you deploy.'
const PITCH =
  'Each service declares what it provides and what it reads. bidirekt compares them in seconds. No running services, no test environment.'
const FOOTNOTE = 'self-hosted · single Go binary'

const LINK_BUTTON = 'border px-3.5 py-2.5 text-[13px]'

export function Hero() {
  return (
    <section className="pt-[88px] pb-14">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-12">
        <div className="flex flex-col gap-6">
          <Eyebrow>{EYEBROW}</Eyebrow>
          <h1 className="text-[40px] leading-[1.2] font-medium tracking-[-0.01em] text-[#f5f5f5]">
            {HEADLINE}
          </h1>
          <p className="max-w-[520px] text-[15px] leading-[1.75] text-secondary">
            {PITCH}
          </p>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap gap-2.5">
              <a
                href="/docs"
                className={`${LINK_BUTTON} border-accent text-accent`}
              >
                [ read the docs ]
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className={`${LINK_BUTTON} border-[#2a2a2a] text-primary hover:text-accent`}
              >
                [ github ↗ ]
              </a>
            </div>
            <p className="text-[12px] text-muted">{FOOTNOTE}</p>
          </div>
        </div>
        <HandshakePane />
      </div>
    </section>
  )
}
