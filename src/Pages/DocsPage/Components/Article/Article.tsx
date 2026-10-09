import type { MouseEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { docsMarkdownHref } from '#/docs'
import type { DocsPageContent } from '#/docs'
import { PrevNext } from '../PrevNext'
import { EditFooter } from '../EditFooter'
import { NotWrittenYet } from '../NotWrittenYet'

type ArticleProps = { page: DocsPageContent; html: string }

export function Article({ page, html }: ArticleProps) {
  const router = useRouter()

  function onArticleClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return
    const anchor = event.target.closest('a')
    if (anchor === null) return
    const href = anchor.getAttribute('href')
    if (href === null || !href.startsWith('/docs')) return
    event.preventDefault()
    void router.navigate({ href })
  }

  return (
    <main className="min-w-0 px-4 pt-6 pb-12 md:px-12 md:pt-8 md:pb-16">
      <div>
        <div className="mb-3 truncate text-[12px] tracking-[0.08em] text-muted uppercase">
          {breadcrumb(page)}
        </div>
        <h1 className="mb-3 text-[24px] leading-[1.15] font-medium tracking-[-0.01em] text-pretty text-primary md:text-[40px]">
          {page.title}
        </h1>
        {page.description !== null && (
          <p className="mb-8 text-[14px] leading-[1.7] text-pretty text-secondary">
            {page.description}
          </p>
        )}
        {page.isPlaceholder && <NotWrittenYet page={page} />}
        {!page.isPlaceholder && (
          <article
            data-pagefind-body
            onClick={onArticleClick}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        <PrevNext prev={page.prev} next={page.next} />
        <EditFooter
          editUrl={page.editUrl}
          markdownHref={docsMarkdownHref(page.path)}
        />
      </div>
    </main>
  )
}

function breadcrumb(page: DocsPageContent): string {
  if (page.group === null) return `docs / ${page.label}`
  return `${page.group} / ${page.label}`
}
