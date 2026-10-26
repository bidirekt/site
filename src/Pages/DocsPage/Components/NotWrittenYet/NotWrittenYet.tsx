import { Link } from '@tanstack/react-router'
import type { DocsPageContent } from '#/docs'
import { docsLinkProps } from '#/docs'
import { Button } from '#/Components/Button'
import { Pane } from '#/Components/Pane'

type NotWrittenYetProps = { page: DocsPageContent }

const LINK =
  'text-primary underline decoration-accent underline-offset-[3px] hover:text-accent'

export function NotWrittenYet({ page }: NotWrittenYetProps) {
  return (
    <Pane className="mt-8" bodyClassName="p-0">
      <div className="p-4 text-[16px] leading-[1.7] text-secondary">
        <pre className="overflow-x-auto text-[13.5px]">
          <span className="text-accent">$</span> cat {page.path}
          {'\n'}
          <span className="text-muted">&gt; Not written yet.</span>
        </pre>
        <p className="mt-4">
          This page exists in the tree but has no body yet. Until it does, the
          surrounding pages cover the ground:
        </p>
        <div className="mt-2 whitespace-pre [&>span]:font-mono [&>span]:text-muted">
          <span>{'├── '}</span>
          <Link
            {...docsLinkProps('concepts/how-the-broker-works.md')}
            className={LINK}
          >
            How the broker works
          </Link>
          {'\n'}
          <span>{'└── '}</span>
          <Link {...docsLinkProps('reference/cli.md')} className={LINK}>
            CLI reference
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        <Button variant="primary" href={page.editUrl}>
          Write it on GitHub ↗
        </Button>
      </div>
    </Pane>
  )
}
