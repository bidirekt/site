import { createFileRoute, notFound } from '@tanstack/react-router'
import { loadDocsPage } from '#/docs'
import { DocsPage, docsPageHead } from '#/Pages/DocsPage'

export const Route = createFileRoute('/docs/')({
  loader: () => {
    const page = loadDocsPage('README.md')
    if (page === null) throw notFound()
    return page
  },
  head: ({ loaderData }) => docsPageHead(loaderData),
  component: DocsIndexRoute,
})

function DocsIndexRoute() {
  const page = Route.useLoaderData()
  return <DocsPage page={page} />
}
