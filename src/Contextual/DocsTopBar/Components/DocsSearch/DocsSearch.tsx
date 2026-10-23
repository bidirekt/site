import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { tv } from 'tailwind-variants'
import { DOCS_ENTRIES, docsHref } from '#/docs'
import { searchDocs } from './pagefind'
import type { SearchHit } from './pagefind'

type SearchRow = { href: string; title: string; context: string }

const RESULTS_ID = 'docs-search-results'
const ONLY_IN_THE_BUILD =
  'Search only exists in the build: npm run build && npm run preview'
const ARROW_STEP: Partial<Record<string, number>> = {
  ArrowDown: 1,
  ArrowUp: -1,
}
const KEY =
  'rounded-[4px] bg-raised px-1.5 py-px font-mono text-[12px] font-medium text-secondary'
const PAGE_ROWS: Array<SearchRow> = DOCS_ENTRIES.map((entry) => ({
  href: docsHref(entry.path),
  title: entry.label,
  context: entry.group ?? '',
}))
const GROUP_BY_HREF = new Map(PAGE_ROWS.map((row) => [row.href, row.context]))

const resultLink = tv({
  base: 'flex justify-between gap-3 rounded-[7px] px-3 py-[9px] text-[14px]',
  variants: {
    active: {
      true: 'bg-raised text-primary',
      false: 'text-secondary',
    },
  },
})

export function DocsSearch() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Array<SearchHit> | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const term = query.trim()
  const rows = searchRows(term, hits)
  const message = emptyMessage(term, hits)

  useEffect(() => {
    function openOnShortcut(event: globalThis.KeyboardEvent) {
      if (!isOpenShortcut(event)) return
      event.preventDefault()
      openPalette()
    }
    window.addEventListener('keydown', openOnShortcut)
    return () => window.removeEventListener('keydown', openOnShortcut)
  }, [])

  useEffect(() => {
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
  }, [term])

  function openPalette() {
    if (dialogRef.current === null || dialogRef.current.open) return
    openerRef.current = focusedElement()
    changeQuery('')
    dialogRef.current.showModal()
  }

  function closePalette() {
    dialogRef.current?.close()
    openerRef.current?.focus()
  }

  function changeQuery(value: string) {
    setQuery(value)
    setActiveIndex(0)
    if (value.trim() === '') setHits(null)
  }

  function openRow(row: SearchRow) {
    closePalette()
    void router.navigate({ href: row.href })
  }

  function moveActive(step: number) {
    const next = Math.min(Math.max(activeIndex + step, 0), rows.length - 1)
    setActiveIndex(next)
    listRef.current?.children.item(next)?.scrollIntoView({ block: 'nearest' })
  }

  function onQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (rows.length > 0) openRow(rows[activeIndex])
      return
    }
    const step = ARROW_STEP[event.key]
    if (step === undefined || rows.length === 0) return
    event.preventDefault()
    moveActive(step)
  }

  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closePalette()
  }

  function closeOnCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    closePalette()
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={openPalette}
        className="mx-auto flex h-[38px] min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[10px] border border-line bg-pane px-3 text-left text-[14px] text-muted shadow-sheen transition-colors duration-150 ease-out hover:bg-raised motion-reduce:transition-none min-[821px]:max-w-[420px]"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="flex-none"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m11 11 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="flex-1 truncate">Search docs</span>
        <kbd className={`${KEY} max-[820px]:hidden`}>/</kbd>
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Search docs"
        onClick={closeOnBackdropClick}
        onCancel={closeOnCancel}
        className="mx-auto mt-[max(12vh,env(safe-area-inset-top,0px))] w-[calc(100%-32px)] max-w-[560px] overflow-hidden rounded-[14px] border border-line bg-pane/90 text-primary shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-[16px] backdrop:bg-black/60"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={onQueryKeyDown}
          placeholder="Search pages and sections…"
          autoComplete="off"
          aria-label="Search"
          aria-controls={RESULTS_ID}
          className="h-[52px] w-full border-b border-raised bg-transparent px-4 text-[16px] text-primary outline-none! placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        <ul
          ref={listRef}
          id={RESULTS_ID}
          role="listbox"
          className="max-h-[50vh] overflow-y-auto p-1.5"
        >
          {message !== null && (
            <li className="px-3 py-3.5 text-[14px] text-muted">{message}</li>
          )}
          {rows.map((row, index) => (
            <li key={row.href}>
              <ResultLink
                row={row}
                active={index === activeIndex}
                onOpen={() => openRow(row)}
                onHover={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
        <div className="flex gap-3.5 bg-raised px-3.5 py-2 text-[12px] text-muted">
          <span>
            <kbd className={KEY}>↑</kbd> <kbd className={KEY}>↓</kbd> move
          </span>
          <span>
            <kbd className={KEY}>↵</kbd> open
          </span>
          <span>
            <kbd className={KEY}>esc</kbd> close
          </span>
        </div>
      </dialog>
    </>
  )
}

type ResultLinkProps = {
  row: SearchRow
  active: boolean
  onOpen: () => void
  onHover: () => void
}

function ResultLink({ row, active, onOpen, onHover }: ResultLinkProps) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onOpen()
  }

  return (
    <a
      href={row.href}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      onClick={onClick}
      onMouseMove={onHover}
      className={resultLink({ active })}
    >
      <span className="min-w-0">{row.title}</span>
      <small className="text-[12px] whitespace-nowrap text-muted">
        {row.context}
      </small>
    </a>
  )
}

function searchRows(
  term: string,
  hits: Array<SearchHit> | null,
): Array<SearchRow> {
  if (term === '') return PAGE_ROWS
  if (hits === null) return []
  return hits.flatMap((hit) => [
    {
      href: hit.href,
      title: hit.title,
      context: GROUP_BY_HREF.get(hit.href) ?? '',
    },
    ...hit.sections.map((section) => ({
      href: section.href,
      title: section.title,
      context: hit.title,
    })),
  ])
}

function emptyMessage(
  term: string,
  hits: Array<SearchHit> | null,
): string | null {
  if (term === '') return null
  if (import.meta.env.DEV) return ONLY_IN_THE_BUILD
  if (hits?.length === 0) return `No page or section matches "${term}".`
  return null
}

function focusedElement(): HTMLElement | null {
  if (document.activeElement instanceof HTMLElement)
    return document.activeElement
  return null
}

function isOpenShortcut(event: globalThis.KeyboardEvent): boolean {
  if (event.key === 'k' && (event.metaKey || event.ctrlKey)) return true
  return event.key === '/' && !isTextField(event.target)
}

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  )
}
