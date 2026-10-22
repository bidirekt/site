import type { MouseEvent } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
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
    <main className="min-w-0 px-4 pt-6 pb-24 md:px-12 md:pt-10">
      <div>
        <div className="mb-2 text-[13px] text-muted">
          <Link to="/docs" className="pressable hover:text-primary">
            Docs
          </Link>
          {page.group !== null && ` / ${page.group}`}
        </div>
        <h1 className="mb-3 text-[clamp(34px,4.6vw,52px)] leading-[1.05] font-semibold tracking-[-0.04em] text-pretty ink-gradient">
          {page.title}
        </h1>
        {page.description !== null && (
          <p className="mb-7 max-w-[64ch] text-[18px] leading-[1.7] text-pretty text-secondary">
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
