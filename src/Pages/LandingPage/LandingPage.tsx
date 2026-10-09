import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'
import { ContractsComparison } from './Components/ContractsComparison'
import { Faq } from './Components/Faq'
import { Hero } from './Components/Hero'
import { TerminalPane } from './Components/TerminalPane'
import { ThreeSteps } from './Components/ThreeSteps'
import { TryIt } from './Components/TryIt'

const TITLE = 'bidirekt — catch breaking API changes before production'
const DESCRIPTION =
  'bidirekt is static, bidirectional contract testing. Each service declares what it provides and what it reads in one YAML file; a self-hosted broker answers can-i-deploy in seconds, with no running services and no test environment.'
const SOCIAL_DESCRIPTION =
  'Know if your deploy breaks another service, before you deploy. Static contract testing: no running services, no test environment.'

const CONTENT = 'mx-auto w-full max-w-[1080px] px-6'

export function landingPageHead() {
  return pageHead('/', TITLE, DESCRIPTION, SOCIAL_DESCRIPTION)
}

export function LandingPage() {
  return (
    <div className="landing flex min-h-screen flex-col bg-page text-[14px] leading-[1.6] text-primary">
      <SiteNav />
      <main>
        <div className={CONTENT}>
          <Hero />
          <TerminalPane />
        </div>
        <div className="border-t border-line">
          <div className={CONTENT}>
            <ContractsComparison />
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
