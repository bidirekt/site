import { createFileRoute } from '@tanstack/react-router'
import { LandingPage, landingPageHead } from '#/Pages/LandingPage'

export const Route = createFileRoute('/')({
  head: landingPageHead,
  component: LandingPage,
})
