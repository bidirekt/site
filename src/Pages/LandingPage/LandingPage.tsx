import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'
import { Commands } from './Components/Commands'
import { Comparison } from './Components/Comparison'
import { Faq } from './Components/Faq'
import { Hero } from './Components/Hero'
import { LiveCheck } from './Components/LiveCheck'
import { TryIt } from './Components/TryIt'

const TITLE = 'Bidirekt — integration testing for microservices'
const DESCRIPTION =
  'Integration testing for microservices without a test environment. Contract testing in both directions: know which service a deploy breaks, and how to fix it.'
const SOCIAL_DESCRIPTION =
  'Know before you deploy. Integration testing for microservices, without the test environment.'

const CONTENT = 'mx-auto w-full max-w-[1120px] px-4'
const BAND = 'border-t border-line bg-linear-to-b from-pane to-page'

export function landingPageHead() {
  return pageHead('/', TITLE, DESCRIPTION, SOCIAL_DESCRIPTION)
}

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />
      <main>
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 stage-light"
          />
          <div className={CONTENT}>
            <Hero />
            <LiveCheck />
          </div>
        </div>
        <div className={CONTENT}>
          <Comparison />
        </div>
        <div className={BAND}>
          <div className={CONTENT}>
            <Commands />
          </div>
        </div>
        <div className={CONTENT}>
          <TryIt />
        </div>
        <div className={BAND}>
          <div className={CONTENT}>
            <Faq />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
