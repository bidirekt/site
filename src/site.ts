export const SITE_URL = 'https://bidirekt.com'

const OG_IMAGE_URL = `${SITE_URL}/og.png`

export function isSiteLaunched(env: Record<string, unknown>): boolean {
  return env.VITE_SITE_LAUNCHED === 'true'
}

export function analyticsMeasurementId(
  env: Record<string, unknown>,
): string | null {
  if (!isSiteLaunched(env)) return null
  const measurementId = env.VITE_GA_MEASUREMENT_ID
  if (typeof measurementId !== 'string' || measurementId === '') return null
  return measurementId
}

type PageHeadMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }

type PageHeadLink = { rel: string; href: string; type?: string }

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path.replace(/\/$/, '')}/`
}

export function pageHead(
  path: string,
  title: string,
  description: string | null,
  socialDescription?: string,
): { meta: Array<PageHeadMeta>; links: Array<PageHeadLink> } {
  const url = canonicalUrl(path)
  return {
    meta: [
      { title },
      ...descriptionMeta(description, socialDescription),
      { property: 'og:title', content: title },
      { property: 'og:url', content: url },
      { property: 'og:image', content: OG_IMAGE_URL },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

function descriptionMeta(
  description: string | null,
  socialDescription?: string,
): Array<PageHeadMeta> {
  if (description === null) return []
  return [
    { name: 'description', content: description },
    { property: 'og:description', content: socialDescription ?? description },
  ]
}
