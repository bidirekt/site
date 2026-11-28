import type { ReactNode } from 'react'
import { Arrow } from '#/Components/Arrow'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'
import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'

const TITLE = 'Contact'
const DESCRIPTION =
  'Report a bug or a security issue, contribute to Bidirekt, follow the CLI and broker releases, and reach the author.'
const GITHUB_URL = 'https://github.com/bidirekt'
const LINKEDIN_URL = 'https://www.linkedin.com/in/alefcastelo'
const CLA_SIGNATURE = 'I have read the CLA Document and I hereby sign the CLA'
const ISSUE_REPOS = [
  { name: 'cli', label: 'CLI issues' },
  { name: 'broker', label: 'Broker issues' },
  { name: 'typescript-sdk', label: 'TypeScript SDK issues' },
  { name: 'go-sdk', label: 'Go SDK issues' },
  { name: 'php-sdk', label: 'PHP SDK issues' },
]
const PANE_TITLE =
  'font-display text-[22px] leading-[1.25] font-semibold tracking-[-0.02em] text-primary'
const PANE_TEXT = 'text-[15px] leading-[1.7] text-secondary text-pretty'
const ACTIONS = 'mt-auto flex flex-wrap gap-2'

export function contactPageHead() {
  return pageHead('/contact', `${TITLE} · Bidirekt`, DESCRIPTION)
}

export function ContactPage() {
  return (
    <main className="flex min-h-svh flex-col">
      <SiteNav />
      <section className="mx-auto w-full max-w-[1120px] px-4 pt-12 pb-8 md:pt-24 md:pb-16">
        <h1 className="mb-8 text-[clamp(34px,4.6vw,52px)] leading-[1.05] font-display font-semibold tracking-[-0.035em] text-pretty text-primary">
          Report a bug, contribute, talk to the author.
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <h2 className={PANE_TITLE}>Report a bug</h2>
            <p className={PANE_TEXT}>
              Open an issue in the repository of the part that fails, with the{' '}
              <Code>Bug report</Code> form. Include what happened, what you
              expected, the command you ran and what it printed, and the
              versions: <Code>bidirekt --version</Code> for the CLI, and the{' '}
              <Code>brokerVersion</Code> that the broker&apos;s{' '}
              <Code>/health</Code> returns.
            </p>
            <div className={ACTIONS}>
              {ISSUE_REPOS.map((repo) => (
                <ExternalButton
                  key={repo.name}
                  href={`${GITHUB_URL}/${repo.name}/issues`}
                >
                  {repo.label}
                </ExternalButton>
              ))}
            </div>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <h2 className={PANE_TITLE}>Report a security issue</h2>
            <p className={PANE_TEXT}>
              Report a vulnerability privately, with the{' '}
              <Code>Report a vulnerability</Code> button in the{' '}
              <Code>Security and quality</Code> tab of the affected repository.
              Never open a public issue for a vulnerability.
            </p>
            <p className={PANE_TEXT}>
              The report stays private until the fix is released and the
              security advisory is published. Only the latest release of the
              CLI, the broker and each SDK gets security fixes.
            </p>
            <div className={ACTIONS}>
              <ExternalButton
                href={`${GITHUB_URL}/broker/blob/main/SECURITY.md`}
              >
                Security policy
              </ExternalButton>
            </div>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <h2 className={PANE_TITLE}>Contribute</h2>
            <p className={PANE_TEXT}>
              Fork the repository, create a branch, and open a pull request
              against <Code>main</Code>. The CI checks must pass before it is
              merged; each repository&apos;s <Code>CONTRIBUTING.md</Code> says
              how to run them.
            </p>
            <p className={PANE_TEXT}>
              Pull requests to the broker ask you to sign the Contributor
              License Agreement: a bot comments on the pull request, and you
              sign by posting a comment whose entire text is{' '}
              <Code>{CLA_SIGNATURE}</Code>.
            </p>
            <div className={ACTIONS}>
              <ExternalButton
                href={`${GITHUB_URL}/broker/blob/main/CONTRIBUTING.md`}
              >
                Contributing guide
              </ExternalButton>
              <ExternalButton href={`${GITHUB_URL}/broker/blob/main/CLA.md`}>
                CLA
              </ExternalButton>
            </div>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <h2 className={PANE_TITLE}>Follow the releases</h2>
            <p className={PANE_TEXT}>
              Each new version of the CLI and the broker is published as a
              GitHub release. <Code>Watch</Code> → <Code>Custom</Code> →{' '}
              <Code>Releases</Code> on each repo notifies you of a new version.
            </p>
            <div className={ACTIONS}>
              <ExternalButton href={`${GITHUB_URL}/cli/releases`}>
                CLI releases
              </ExternalButton>
              <ExternalButton href={`${GITHUB_URL}/broker/releases`}>
                Broker releases
              </ExternalButton>
            </div>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <h2 className={PANE_TITLE}>Talk to the author</h2>
            <p className={PANE_TEXT}>
              Bidirekt is built by Alef Castelo. Questions, feedback and ideas
              are welcome on LinkedIn.
            </p>
            <div className={ACTIONS}>
              <Button variant="primary" href={LINKEDIN_URL}>
                LinkedIn
                <Arrow direction="external" />
              </Button>
            </div>
          </Pane>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

function Code({ children }: { children: ReactNode }) {
  return <code className="text-primary">{children}</code>
}

function ExternalButton({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Button href={href}>
      {children}
      <Arrow direction="external" />
    </Button>
  )
}
