import { Button } from '#/Components/Button'
import { Eyebrow } from '#/Components/Eyebrow'
import { Pane } from '#/Components/Pane'
import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'

const TITLE = 'contact'
const DESCRIPTION =
  'Reach the author of Bidirekt on LinkedIn, and follow the CLI and broker releases.'
const LINKEDIN_URL = 'https://www.linkedin.com/in/alefcastelo/'
const CLI_RELEASES_URL = 'https://github.com/bidirekt/cli/releases'
const BROKER_RELEASES_URL = 'https://github.com/bidirekt/broker/releases'
const PANE_TEXT = 'text-[13px] leading-[1.7] text-secondary text-pretty'

export function contactPageHead() {
  return pageHead('/contact', `${TITLE} · bidirekt`, DESCRIPTION)
}

export function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav />
      <section className="mx-auto w-full max-w-[1080px] px-6 pt-12 pb-8 md:pt-24 md:pb-16">
        <Eyebrow className="mb-6">{TITLE}</Eyebrow>
        <h1 className="mb-8 text-[24px] leading-[1.15] font-medium tracking-[-0.01em] text-pretty md:text-[40px]">
          Talk to the author, follow the releases.
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <Pane label="author" bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              Bidirekt is built by Alef Castelo. Questions, feedback and ideas
              are welcome on LinkedIn.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button variant="primary" href={LINKEDIN_URL}>
                [ linkedin ↗ ]
              </Button>
            </div>
          </Pane>
          <Pane label="releases" bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              Each new version of the CLI and the broker is published as a
              GitHub release. <code className="text-primary">Watch</code> →{' '}
              <code className="text-primary">Custom</code> →{' '}
              <code className="text-primary">Releases</code> on each repo
              notifies you of a new version.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button href={CLI_RELEASES_URL}>[ cli releases ↗ ]</Button>
              <Button href={BROKER_RELEASES_URL}>[ broker releases ↗ ]</Button>
            </div>
          </Pane>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
