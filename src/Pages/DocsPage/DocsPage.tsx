import { useEffect, useMemo, useRef, useState } from 'react'
import type { DocsPageContent } from '#/docs'
import { renderDocsMarkdown } from '#/markdown'
import { DocsTopBar } from '#/Contextual/DocsTopBar'
import { DocsSidebar } from '#/Contextual/DocsSidebar'
import { DocsToc } from '#/Contextual/DocsToc'
import { Article } from './Components/Article'

type DocsPageProps = { page: DocsPageContent }

type HeadMeta = { title?: string; name?: string; content?: string }

export function docsPageHead(page: DocsPageContent | undefined) {
  if (page === undefined) return {}
  const meta: Array<HeadMeta> = [{ title: `${page.title} · bidirekt docs` }]
  if (page.description !== null) {
    meta.push({ name: 'description', content: page.description })
  }
  return { meta }
}

export function DocsPage({ page }: DocsPageProps) {
  const [query, setQuery] = useState('')
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
    setQuery('')
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
        query={query}
        onQueryChange={setQuery}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((previous) => !previous)}
      />
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_200px] md:items-start">
        <DocsSidebar
          activePath={page.path}
          query={query}
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
