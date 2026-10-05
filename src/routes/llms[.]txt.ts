import { createFileRoute } from '@tanstack/react-router'
import { DOCS_TREE, llmsTxtFromDocsTree } from '#/docs'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(llmsTxtFromDocsTree(DOCS_TREE), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    },
  },
})
