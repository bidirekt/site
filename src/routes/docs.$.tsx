import { createFileRoute, notFound } from '@tanstack/react-router'
import { docsPathFromSplat, loadDocsPage } from '#/docs'
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
})

function DocsSplatRoute() {
  const page = Route.useLoaderData()
  return <DocsPage page={page} />
}
