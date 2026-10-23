import { useEffect, useMemo, useRef, useState } from 'react'
import { docsHref, docsMarkdownUrl } from '#/docs'
import type { DocsPageContent } from '#/docs'
import { renderDocsMarkdown } from '#/markdown'
import { pageHead } from '#/site'
import { DocsTopBar } from '#/Contextual/DocsTopBar'
import { DocsSidebar } from '#/Contextual/DocsSidebar'
import { DocsToc } from '#/Contextual/DocsToc'
import { Article } from './Components/Article'

type DocsPageProps = { page: DocsPageContent }

const SIDEBAR_ID = 'docs-sidebar'

export function docsPageHead(page: DocsPageContent | undefined) {
  if (page === undefined) return {}
  const head = pageHead(
    docsHref(page.path),
    `${page.title} · bidirekt docs`,
    page.description,
  )
  head.links.push({
    rel: 'alternate',
    type: 'text/markdown',
    href: docsMarkdownUrl(page.path),
  })
  return head
}

export function DocsPage({ page }: DocsPageProps) {
  const [navOpen, setNavOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const wasNavOpen = useRef(false)

  const { html, toc } = useMemo(
    () =>
      renderDocsMarkdown(page.body, {
        pagePath: page.path,
        title: page.title,
      }),
    [page.body, page.path, page.title],
  )

  useEffect(() => {
    if (wasNavOpen.current && !navOpen) menuButtonRef.current?.focus()
    wasNavOpen.current = navOpen
    if (!navOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [navOpen])

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_360px_at_50%_-120px,var(--color-glow),transparent_70%)] bg-no-repeat leading-[1.7]">
      <DocsTopBar
        navId={SIDEBAR_ID}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((previous) => !previous)}
        menuButtonRef={menuButtonRef}
      />
      <div
        aria-hidden="true"
        onClick={() => setNavOpen(false)}
        className={`fixed inset-0 z-34 hidden bg-black/55 transition-opacity duration-200 max-[820px]:block ${scrimState(navOpen)}`}
      />
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-start gap-10 px-4 min-[821px]:grid-cols-[232px_minmax(0,1fr)_200px] min-[1081px]:grid-cols-[248px_minmax(0,1fr)_200px] min-[1081px]:gap-12">
        <DocsSidebar
          id={SIDEBAR_ID}
          activePath={page.path}
          open={navOpen}
          onNavigate={() => setNavOpen(false)}
        />
        <Article page={page} html={html} />
        <DocsToc toc={toc} />
      </div>
    </div>
  )
}

function scrimState(navOpen: boolean): string {
  if (navOpen) return 'opacity-100'
  return 'pointer-events-none opacity-0'
}
