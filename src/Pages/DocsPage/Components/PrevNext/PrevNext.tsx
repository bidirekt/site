import { Link } from '@tanstack/react-router'
import type { DocsEntry } from '#/docs'
import { docsLinkProps } from '#/docs'

type PrevNextProps = { prev: DocsEntry | null; next: DocsEntry | null }

const SIDE =
  'pressable rounded-pane border border-line bg-pane px-4 py-3.5 shadow-sheen hover:bg-hover active:scale-[0.98]'
const LABEL = 'block text-[12px] text-muted'

export function PrevNext({ prev, next }: PrevNextProps) {
  return (
    <nav
      aria-label="Pages"
      className="mt-16 grid max-w-[760px] gap-3 min-[821px]:grid-cols-2"
    >
      {prev !== null && (
        <Link {...docsLinkProps(prev.path)} className={SIDE}>
          <span className={LABEL}>← Previous</span>
          {prev.label}
        </Link>
      )}
      {next !== null && (
        <Link
          {...docsLinkProps(next.path)}
          className={`${SIDE} text-right min-[821px]:col-start-2`}
        >
          <span className={LABEL}>Next →</span>
          {next.label}
        </Link>
      )}
    </nav>
  )
}
