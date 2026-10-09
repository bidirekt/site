export const SITE_URL = 'https://bidirekt.com'

export function isSiteLaunched(env: Record<string, unknown>): boolean {
  return env.VITE_SITE_LAUNCHED === 'true'
}
