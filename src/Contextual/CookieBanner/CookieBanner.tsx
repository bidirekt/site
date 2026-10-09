import { useEffect, useState } from 'react'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'
import {
  ANALYTICS_ON,
  chooseConsent,
  hasSavedConsentChoice,
  onOpenCookieSettings,
} from './consent'
import type { ConsentChoice } from './consent'

const LINK = 'text-accent hover:text-primary'

export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!ANALYTICS_ON) return
    if (!hasSavedConsentChoice()) setOpen(true)
    return onOpenCookieSettings(() => setOpen(true))
  }, [])

  function choose(choice: ConsentChoice) {
    chooseConsent(choice)
    setOpen(false)
  }

  if (!open) return null
  return (
    <Pane
      title="cookies"
      className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-[720px]"
      bodyClassName="flex flex-wrap items-center gap-x-4 gap-y-3"
    >
      <p className="min-w-[240px] flex-1 text-[13px] leading-[1.7] text-secondary text-pretty">
        Allow Google Analytics cookies to count visits and see where they come
        from? More on the{' '}
        <a href="/privacy" className={LINK}>
          privacy
        </a>{' '}
        page.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => choose('accepted')}>[ accept ]</Button>
        <Button onClick={() => choose('rejected')}>[ reject ]</Button>
      </div>
    </Pane>
  )
}
