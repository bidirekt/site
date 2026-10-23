import type { TocEntry } from '#/markdown'

type DocsTocProps = { toc: Array<TocEntry> }

const GLYPH: Record<TocEntry['level'], string> = { 2: '├', 3: '  └' }
const INDENT: Record<TocEntry['level'], string> = { 2: 'pl-0', 3: 'pl-4' }

export function DocsToc({ toc }: DocsTocProps) {
  if (toc.length === 0) return null
  return (
    <aside className="hidden pt-8 pr-4 pb-6 min-[821px]:sticky min-[821px]:top-[60px] min-[821px]:block min-[821px]:max-h-[calc(100vh-60px)] min-[821px]:overflow-y-auto">
      <div className="mb-2 text-[13px] font-medium whitespace-nowrap text-primary">
        on this page
      </div>
      {toc.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className={`pressable block truncate py-[3px] text-[13px] leading-[1.6] text-muted hover:text-primary ${INDENT[entry.level]}`}
        >
          <span className="font-mono">{GLYPH[entry.level]} </span>
          {entry.text}
        </a>
      ))}
    </aside>
  )
}
