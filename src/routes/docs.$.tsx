import { createFileRoute, notFound } from '@tanstack/react-router'
import { docsMarkdownFromPath, docsPathFromSplat, loadDocsPage } from '#/docs'
import { DocsPage, docsPageHead } from '#/Pages/DocsPage'

export const Route = createFileRoute('/docs/$')({
  loader: ({ params }) => {
    const path = docsPathFromSplat(params._splat)
    if (path === null) throw notFound()
    const page = loadDocsPage(path)
    if (page === null) throw notFound()
    return page
  },
  head: ({ loaderData }) => docsPageHead(loaderData),
  component: DocsSplatRoute,
  server: {
    handlers: {
      GET: ({ params, next }) => {
        if (!params._splat?.endsWith('.md')) return next()
        return markdownResponseFromPath(params._splat)
      },
    },
  },
})

function markdownResponseFromPath(path: string): Response {
  const markdown = docsMarkdownFromPath(path)
  if (markdown === null) return new Response('Not found', { status: 404 })
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

function DocsSplatRoute() {
  const page = Route.useLoaderData()
  return <DocsPage page={page} />
}
