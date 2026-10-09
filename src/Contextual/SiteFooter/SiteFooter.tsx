import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CookieSettingsButton } from '#/Contextual/CookieBanner'
import { REPOS, useLatestReleases } from './useLatestReleases'
import type { LatestRelease, Repo } from './useLatestReleases'

const GITHUB_URL = 'https://github.com/bidirekt'
const FOOTER_LINK = 'text-secondary hover:text-accent'
const SEPARATOR = ' · '

export function SiteFooter() {
  const latest = useLatestReleases()

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-3 px-6 py-[18px] text-[12px] text-muted">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {latest.length > 0 && <LatestReleases releases={latest} />}
          <span>
            all releases:{' '}
            {REPOS.map((repo, index) => (
              <Fragment key={repo}>
                {index > 0 && SEPARATOR}
                <ExternalLink href={releasesUrl(repo)}>{repo}</ExternalLink>
              </Fragment>
            ))}
          </span>
        </div>
        <div className="flex flex-wrap gap-[18px]">
          <a href="/docs" className={FOOTER_LINK}>
            docs
          </a>
          <a href="/llms.txt" className={FOOTER_LINK}>
            llms.txt
          </a>
          <a href="/contact" className={FOOTER_LINK}>
            contact
          </a>
          <ExternalLink href={GITHUB_URL}>github</ExternalLink>
          <a href="/privacy" className={FOOTER_LINK}>
            privacy
          </a>
          <CookieSettingsButton variant="ghost" className={FOOTER_LINK}>
            cookie settings
          </CookieSettingsButton>
        </div>
      </div>
    </footer>
  )
}

function LatestReleases({ releases }: { releases: Array<LatestRelease> }) {
  return (
    <span>
      latest:{' '}
      {releases.map((release, index) => (
        <Fragment key={release.repo}>
          {index > 0 && SEPARATOR}
          {release.repo}{' '}
          <ExternalLink href={release.url}>{release.tag}</ExternalLink>
        </Fragment>
      ))}
    </span>
  )
}

function ExternalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={FOOTER_LINK}>
      {children}
    </a>
  )
}

function releasesUrl(repo: Repo): string {
  return `${GITHUB_URL}/${repo}/releases`
}
