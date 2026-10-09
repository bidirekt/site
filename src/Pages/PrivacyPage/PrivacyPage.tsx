import { Button } from '#/Components/Button'
import { Eyebrow } from '#/Components/Eyebrow'
import { Pane } from '#/Components/Pane'
import { CookieSettingsButton } from '#/Contextual/CookieBanner'
import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'

const TITLE = 'privacy'
const DESCRIPTION =
  'What bidirekt.com measures with Google Analytics, the cookies it sets only if you accept, and your rights under the LGPD and the GDPR.'
const LINKEDIN_URL = 'https://www.linkedin.com/in/alefcastelo/'
const PANE_TEXT = 'text-[13px] leading-[1.7] text-secondary text-pretty'
const COOKIES = [
  {
    name: '_ga',
    duration: '2 years',
    purpose: 'tells one visitor from another',
  },
  {
    name: '_ga_<id>',
    duration: '2 years',
    purpose: 'keeps track of the current visit',
  },
]

export function privacyPageHead() {
  return pageHead('/privacy', `${TITLE} · bidirekt`, DESCRIPTION)
}

export function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav />
      <section className="mx-auto w-full max-w-[1080px] px-6 pt-12 pb-8 md:pt-24 md:pb-16">
        <Eyebrow className="mb-6">{TITLE}</Eyebrow>
        <h1 className="mb-8 text-[24px] leading-[1.15] font-medium tracking-[-0.01em] text-pretty md:text-[40px]">
          No cookies until you accept.
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              Bidirekt and this site are run by Alef Araujo Castelo, the
              controller of the personal data described here. For any privacy
              question or request, write to him on LinkedIn.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button variant="primary" href={LINKEDIN_URL}>
                [ linkedin ↗ ]
              </Button>
            </div>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              The site uses Google Analytics 4 to count visits and see where
              they come from, such as a YouTube video, a search engine or
              another site. Its cookies are set only if you accept them in the
              cookie banner.
            </p>
            <p className={PANE_TEXT}>
              Until you choose, and if you reject, Google Analytics runs in
              consent mode: it sets no cookies and sends Google only cookieless
              pings, such as the time, your browser and the page you came from.
            </p>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[13px] leading-[1.7] text-secondary">
              {COOKIES.map((cookie) => (
                <div key={cookie.name} className="contents">
                  <dt className="text-primary">{cookie.name}</dt>
                  <dd>
                    {cookie.duration} · {cookie.purpose}
                  </dd>
                </div>
              ))}
            </dl>
            <p className={PANE_TEXT}>
              Both are Google Analytics cookies on bidirekt.com, set only after
              you accept; <code className="text-primary">{'<id>'}</code> is the
              site's Google Analytics ID.
            </p>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              The site has no forms and keeps no personal data. Your cookie
              choice is saved only in your browser.
            </p>
            <p className={PANE_TEXT}>
              The site is hosted on GitHub Pages, and the footer asks GitHub for
              the latest releases, so GitHub receives your IP address, which it
              logs for security.
            </p>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              Change your choice at any time with cookie settings, here or in
              the footer: the banner opens again and the new choice applies at
              once. After a reject, Google Analytics stops using its cookies;
              your browser can delete the ones already set.
            </p>
            <CookieSettingsButton className="mt-auto self-start">
              [ cookie settings ]
            </CookieSettingsButton>
          </Pane>
          <Pane bodyClassName="flex flex-1 flex-col gap-3">
            <p className={PANE_TEXT}>
              Under Brazil's LGPD and the EU's GDPR you can ask whether and how
              your data is processed, get a copy, have it corrected or deleted,
              object to its use, withdraw your consent at any time, and complain
              to a data protection authority: the ANPD in Brazil, or the
              authority of your EU country. To use these rights, write on
              LinkedIn.
            </p>
          </Pane>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
