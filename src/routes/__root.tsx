import type { ReactNode } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '#/styles.css?url'
import { isSiteLaunched } from '#/site'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'
import { CookieBanner, googleAnalyticsScripts } from '#/Contextual/CookieBanner'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'bidirekt' },
      ...noindexUntilLaunch(),
    ],
    links: [
      {
        rel: 'icon',
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤝</text></svg>',
      },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: googleAnalyticsScripts(),
  }),
  notFoundComponent: NotFound,
  shellComponent: RootShell,
})

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <CookieBanner />
        <Scripts />
      </body>
    </html>
  )
}

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Pane>
        <Button href="/">[ back to / ]</Button>
      </Pane>
    </main>
  )
}

function noindexUntilLaunch(): Array<{ name: string; content: string }> {
  if (isSiteLaunched(import.meta.env)) return []
  return [{ name: 'robots', content: 'noindex' }]
}
