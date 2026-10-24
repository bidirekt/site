import { analyticsMeasurementId } from '#/site'

export type ConsentChoice = 'accepted' | 'rejected'

const MEASUREMENT_ID = analyticsMeasurementId(import.meta.env)

export const ANALYTICS_ON = MEASUREMENT_ID !== null

const CONSENT_KEY = 'bidirekt-cookie-consent'
const GTAG_URL = 'https://www.googletagmanager.com/gtag/js'
const ANALYTICS_STORAGE: Record<ConsentChoice, 'granted' | 'denied'> = {
  accepted: 'granted',
  rejected: 'denied',
}

const cookieSettingsListeners = new Set<() => void>()

declare global {
  interface Window {
    dataLayer?: Array<unknown>
    gtag?: (...args: Array<unknown>) => void
  }
}

export function loadGoogleAnalytics() {
  if (MEASUREMENT_ID === null || window.gtag) return
  const dataLayer: Array<unknown> = []
  window.dataLayer = dataLayer
  // gtag.js runs only commands pushed as Arguments objects, never as arrays.
  window.gtag = function () {
    dataLayer.push(arguments)
  }
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID)
  const script = document.createElement('script')
  script.async = true
  script.src = `${GTAG_URL}?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.append(script)
}

export function savedConsentChoice(): ConsentChoice | null {
  try {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (saved === 'accepted' || saved === 'rejected') return saved
    return null
  } catch {
    return null
  }
}

export function chooseConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice)
  } catch {}
  window.gtag?.('consent', 'update', {
    analytics_storage: ANALYTICS_STORAGE[choice],
  })
  if (choice === 'accepted') loadGoogleAnalytics()
}

export function openCookieSettings() {
  for (const listener of cookieSettingsListeners) listener()
}

export function onOpenCookieSettings(listener: () => void): () => void {
  cookieSettingsListeners.add(listener)
  return () => {
    cookieSettingsListeners.delete(listener)
  }
}
