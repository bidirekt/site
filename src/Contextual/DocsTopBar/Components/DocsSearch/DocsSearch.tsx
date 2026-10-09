import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Pane } from '#/Components/Pane'
import { searchDocs } from './pagefind'
import type { SearchHit } from './pagefind'

type SearchRow =
  | { kind: 'page'; href: string; title: string; excerpt: string }
  | { kind: 'section'; href: string; title: string; prefix: string }

const ONLY_IN_THE_BUILD =
  'search only exists in the build: npm run build && npm run preview'
const NO_RESULTS = 'no results'
const ARROW_STEP: Partial<Record<string, number>> = {
  ArrowDown: 1,
  ArrowUp: -1,
}
const ROW: Record<SearchRow['kind'], string> = {
  page: 'block px-3 pt-1.5 pb-0.5',
  section: 'flex px-3 text-[12px] leading-[1.7]',
}
const ROW_COLOR: Record<SearchRow['kind'], string> = {
  page: 'text-primary',
  section: 'text-secondary',
}
const EXCERPT =
  'block text-[12px] leading-[1.6] text-secondary [&_mark]:bg-transparent [&_mark]:text-accent'

export function DocsSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [hits, setHits] = useState<Array<SearchHit> | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const rows = searchRows(hits ?? [])
  const message = panelMessage(hits)
  const panelOpen =
    focused && query.trim() !== '' && (message !== null || rows.length > 0)

  useEffect(() => {
    function focusSearchOnSlash(event: globalThis.KeyboardEvent) {
      if (event.key !== '/' || isTextField(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', focusSearchOnSlash)
    return () => window.removeEventListener('keydown', focusSearchOnSlash)
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (term === '' || import.meta.env.DEV) return
    let superseded = false
    void searchDocs(term).then((found) => {
      if (superseded || found === null) return
      setHits(found)
      setActiveIndex(0)
    })
    return () => {
      superseded = true
    }
  }, [query])

  function changeQuery(value: string) {
    setQuery(value)
    if (value.trim() === '') setHits(null)
  }

  function openRow(row: SearchRow) {
    changeQuery('')
    inputRef.current?.blur()
    void router.navigate({ href: row.href })
  }

  function moveActive(step: number) {
    const next = Math.min(Math.max(activeIndex + step, 0), rows.length - 1)
    setActiveIndex(next)
    listRef.current?.children.item(next)?.scrollIntoView({ block: 'nearest' })
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      return
    }
    if (!panelOpen || rows.length === 0) return
    if (event.key === 'Enter') {
      openRow(rows[activeIndex])
      return
    }
    const step = ARROW_STEP[event.key]
    if (step === undefined) return
    event.preventDefault()
    moveActive(step)
  }

  return (
    <div className="flex min-w-0 flex-1 justify-center">
      <div className="w-full max-w-[420px] md:relative">
        <label className="flex h-7 cursor-text items-center gap-2 rounded-[2px] border border-line bg-pane px-2.5 focus-within:border-accent">
          <span className="text-accent">❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onSearchKeyDown}
            placeholder="search docs"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-primary outline-none placeholder:text-muted"
          />
          <span className="hidden text-[12px] text-muted md:block">/</span>
        </label>
        {panelOpen && (
          <div
            onMouseDown={keepInputFocused}
            className="absolute inset-x-0 top-full md:mt-1"
          >
            <Pane
              title="search"
              bodyClassName="max-h-[60vh] overflow-y-auto p-0 py-1"
            >
              {message !== null && (
                <div className="px-3 py-1 text-[12px] leading-[1.6] text-muted">
                  {message}
                </div>
              )}
              <div ref={listRef}>
                {rows.map((row, index) => (
                  <SearchRowLink
                    key={row.href}
                    row={row}
                    active={index === activeIndex}
                    onOpen={() => openRow(row)}
                    onHover={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </Pane>
          </div>
        )}
      </div>
    </div>
  )
}

type SearchRowLinkProps = {
  row: SearchRow
  active: boolean
  onOpen: () => void
  onHover: () => void
}

function SearchRowLink({ row, active, onOpen, onHover }: SearchRowLinkProps) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onOpen()
  }

  return (
    <a
      href={row.href}
      onClick={onClick}
      onMouseEnter={onHover}
      className={`${ROW[row.kind]} ${rowColor(row, active)}`}
    >
      <SearchRowContent row={row} />
    </a>
  )
}

function SearchRowContent({ row }: { row: SearchRow }) {
  if (row.kind === 'section') {
    return (
      <>
        <span className="flex-none whitespace-pre text-muted">
          {row.prefix}
        </span>
        <span className="min-w-0 truncate">{row.title}</span>
      </>
    )
  }
  return (
    <>
      <span className="block text-[13px]">{row.title}</span>
      <span
        className={EXCERPT}
        dangerouslySetInnerHTML={{ __html: row.excerpt }}
      />
    </>
  )
}

function searchRows(hits: Array<SearchHit>): Array<SearchRow> {
  return hits.flatMap((hit): Array<SearchRow> => [
    { kind: 'page', href: hit.href, title: hit.title, excerpt: hit.excerpt },
    ...hit.sections.map((section, index): SearchRow => ({
      kind: 'section',
      href: section.href,
      title: section.title,
      prefix: branchPrefix(index, hit.sections.length),
    })),
  ])
}

function panelMessage(hits: Array<SearchHit> | null): string | null {
  if (import.meta.env.DEV) return ONLY_IN_THE_BUILD
  if (hits?.length === 0) return NO_RESULTS
  return null
}

function branchPrefix(index: number, count: number): string {
  if (index === count - 1) return '└── '
  return '├── '
}

function rowColor(row: SearchRow, active: boolean): string {
  if (active) return 'bg-hover text-accent'
  return ROW_COLOR[row.kind]
}

function keepInputFocused(event: MouseEvent) {
  event.preventDefault()
}

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  )
}
