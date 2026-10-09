import { createFileRoute } from '@tanstack/react-router'
import { ContactPage, contactPageHead } from '#/Pages/ContactPage'

export const Route = createFileRoute('/contact')({
  head: contactPageHead,
  component: ContactPage,
})
