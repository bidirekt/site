import { SiteFooter } from '#/Contextual/SiteFooter'
import { SiteNav } from '#/Contextual/SiteNav'
import { ContractsComparison } from './Components/ContractsComparison'
import { Hero } from './Components/Hero'
import { ThreeSteps } from './Components/ThreeSteps'

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
