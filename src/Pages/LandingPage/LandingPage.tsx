import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'
import { Faq } from './Components/Faq'
import { Hero } from './Components/Hero'
import { LiveCheck } from './Components/LiveCheck'
import { ThreeSteps } from './Components/ThreeSteps'
import { TryIt } from './Components/TryIt'

const TITLE = 'bidirekt — catch breaking API changes before production'
const DESCRIPTION =
  'bidirekt is static, bidirectional contract testing. Each service declares what it provides and what it reads in one YAML file; a self-hosted broker answers can-i-deploy in seconds, with no running services and no test environment.'
const SOCIAL_DESCRIPTION =
  'Know if your deploy breaks another service, before you deploy. Static contract testing: no running services, no test environment.'

const CONTENT = 'mx-auto w-full max-w-[1120px] px-4'

export function landingPageHead() {
  return pageHead('/', TITLE, DESCRIPTION, SOCIAL_DESCRIPTION)
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
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
        <div className="border-t border-line">
          <div className={CONTENT}>
            <ThreeSteps />
            <TryIt />
            <Faq />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
