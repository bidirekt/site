import { useEffect, useState } from 'react'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'
import {
  ANALYTICS_ON,
  chooseConsent,
  loadGoogleAnalytics,
  onOpenCookieSettings,
  savedConsentChoice,
} from './consent'
import type { ConsentChoice } from './consent'

const LINK =
  'text-primary underline decoration-accent underline-offset-[3px] hover:text-accent'

export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!ANALYTICS_ON) return
    const saved = savedConsentChoice()
    if (saved === null) setOpen(true)
    if (saved === 'accepted') loadGoogleAnalytics()
    return onOpenCookieSettings(() => setOpen(true))
  }, [])

  function choose(choice: ConsentChoice) {
    chooseConsent(choice)
    setOpen(false)
  }

  if (!open) return null
  return (
    <Pane
      className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-[720px] shadow-[inset_0_1px_0_var(--color-sheen),0_24px_60px_rgba(0,0,0,0.6)]"
      bodyClassName="flex flex-wrap items-center gap-x-4 gap-y-3"
    >
      <p className="min-w-[240px] flex-1 text-[15px] leading-[1.6] text-secondary text-pretty">
        Allow Google Analytics cookies to count visits and see where they come
        from? More on the{' '}
        <a href="/privacy" className={LINK}>
          privacy
        </a>{' '}
        page.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => choose('accepted')}>Accept</Button>
        <Button onClick={() => choose('rejected')}>Reject</Button>
      </div>
    </Pane>
  )
}
