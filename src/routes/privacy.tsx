import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPage, privacyPageHead } from '#/Pages/PrivacyPage'

export const Route = createFileRoute('/privacy')({
  head: privacyPageHead,
  component: PrivacyPage,
})
