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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const renderedPath = useRef(page.path)

  const { html, toc } = useMemo(
    () =>
      renderDocsMarkdown(page.body, {
        pagePath: page.path,
        title: page.title,
      }),
    [page.body, page.path, page.title],
  )

  useEffect(() => {
    if (renderedPath.current === page.path) return
    renderedPath.current = page.path
    setNavOpen(false)
  }, [page.path])

  function toggleGroup(label: string) {
    setCollapsed((previous) => ({
      ...previous,
      [label]: previous[label] !== true,
    }))
  }

  return (
    <div className="min-h-screen">
      <DocsTopBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((previous) => !previous)}
      />
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_200px] md:items-start">
        <DocsSidebar
          activePath={page.path}
          collapsed={collapsed}
          onToggleGroup={toggleGroup}
          open={navOpen}
        />
        <Article page={page} html={html} />
        <DocsToc toc={toc} />
      </div>
    </div>
  )
}
