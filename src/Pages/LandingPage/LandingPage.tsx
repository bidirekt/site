import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { pageHead } from '#/site'
import { ContractsComparison } from './Components/ContractsComparison'
import { HERO_PITCH, Hero } from './Components/Hero'
import { ThreeSteps } from './Components/ThreeSteps'

const TITLE =
  'Bidirekt — catch the breaking change before it reaches production'

export function landingPageHead() {
  return pageHead('/', TITLE, HERO_PITCH)
}

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav />
      <Hero />
      <ContractsComparison />
      <ThreeSteps />
      <SiteFooter />
    </main>
  )
}
