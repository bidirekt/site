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
    gtag?: (...args: Array<unknown>) => void
  }
}

export function googleAnalyticsScripts() {
  if (MEASUREMENT_ID === null) return []
  return [
    { children: gtagSetup(MEASUREMENT_ID) },
    {
      src: `${GTAG_URL}?id=${encodeURIComponent(MEASUREMENT_ID)}`,
      async: true,
    },
  ]
}

export function hasSavedConsentChoice(): boolean {
  try {
    const saved = localStorage.getItem(CONSENT_KEY)
    return saved === 'accepted' || saved === 'rejected'
  } catch {
    return false
  }
}

export function chooseConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice)
  } catch {}
  window.gtag?.('consent', 'update', {
    analytics_storage: ANALYTICS_STORAGE[choice],
  })
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

function gtagSetup(measurementId: string): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
try {
  if (localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) === 'accepted') gtag('consent', 'update', { analytics_storage: 'granted' });
} catch {}
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)});`
}
