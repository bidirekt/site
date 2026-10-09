export const SITE_URL = 'https://bidirekt.com'

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
