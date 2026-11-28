import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { SITE_URL, pageHead } from '#/site'
import { Catches } from './Components/Catches'
import { Comparison } from './Components/Comparison'
import { Faq } from './Components/Faq'
import { FinalCall } from './Components/FinalCall'
import { Hero } from './Components/Hero'
import { Protocols } from './Components/Protocols'
import { Sdks } from './Components/Sdks'
import { TryIt } from './Components/TryIt'
import { WhatItIs } from './Components/WhatItIs'

const TITLE = 'Bidirectional contract testing for microservices · Bidirekt'
const DESCRIPTION =
  'Each service declares what it provides and what it reads. can-i-deploy tells you, before the deploy, which service a version breaks and the fix for each side. REST and GraphQL, no test environment.'
const SOCIAL_DESCRIPTION =
  'Know which service your deploy breaks. Contract testing in both directions, without the test environment.'

const HOME_URL = `${SITE_URL}/`
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', name: 'Bidirekt', url: HOME_URL },
    {
      '@type': 'Organization',
      name: 'Bidirekt',
      url: HOME_URL,
      sameAs: ['https://github.com/bidirekt'],
    },
  ],
}

const CONTENT = 'mx-auto w-full max-w-[1120px] px-4'
const PLAIN = 'border-t border-line'

export function landingPageHead() {
  return {
    ...pageHead('/', TITLE, DESCRIPTION, SOCIAL_DESCRIPTION),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(STRUCTURED_DATA),
      },
    ],
  }
}

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />
      <main>
        <div className={CONTENT}>
          <Hero />
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <Protocols />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <Sdks />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <WhatItIs />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <Catches />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <Comparison />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <TryIt />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <Faq />
          </div>
        </div>
        <div className={PLAIN}>
          <div className={CONTENT}>
            <FinalCall />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
