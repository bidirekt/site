import type { TocEntry } from '#/markdown'

type DocsTocProps = { toc: Array<TocEntry> }

const GLYPH: Record<TocEntry['level'], string> = { 2: '├', 3: '  └' }
const INDENT: Record<TocEntry['level'], string> = { 2: 'pl-0', 3: 'pl-4' }

export function DocsToc({ toc }: DocsTocProps) {
  if (toc.length === 0) return null
  return (
    <aside className="hidden pt-8 pr-4 pb-6 md:sticky md:top-11 md:block md:max-h-[calc(100vh-44px)] md:overflow-y-auto">
      <div className="mb-2 text-[12px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
        on this page
      </div>
      {toc.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className={`block truncate py-0.5 text-[12px] leading-[1.6] text-secondary hover:text-primary ${INDENT[entry.level]}`}
        >
          <span className="text-muted">{GLYPH[entry.level]} </span>
          {entry.text}
        </a>
      ))}
    </aside>
  )
}
