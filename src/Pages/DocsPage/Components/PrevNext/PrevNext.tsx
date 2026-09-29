import { Link } from '@tanstack/react-router'
import type { DocsEntry } from '#/docs'
import { docsLinkProps } from '#/docs'

type PrevNextProps = { prev: DocsEntry | null; next: DocsEntry | null }

const SIDE =
  'flex min-w-[200px] flex-1 flex-col gap-1 rounded-[2px] border border-line px-3 py-2.5 hover:border-accent hover:bg-hover'
const LABEL = 'text-[12px] tracking-[0.08em] text-muted uppercase'
const NAME = 'text-[13px] text-primary'

export function PrevNext({ prev, next }: PrevNextProps) {
  return (
    <nav className="mt-12 flex flex-wrap gap-4 border-t border-line pt-4">
      {prev !== null && (
        <Link {...docsLinkProps(prev.path)} className={SIDE}>
          <span className={LABEL}>← previous</span>
          <span className={NAME}>{prev.label}</span>
        </Link>
      )}
      {next !== null && (
        <Link
          {...docsLinkProps(next.path)}
          className={`${SIDE} items-end text-right`}
        >
          <span className={LABEL}>next →</span>
          <span className={NAME}>{next.label}</span>
        </Link>
      )}
    </nav>
  )
}
