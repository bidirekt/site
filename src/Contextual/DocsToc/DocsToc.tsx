import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { tv } from 'tailwind-variants'
import type { TocEntry } from '#/markdown'

type DocsTocProps = { toc: Array<TocEntry> }

const TITLE = 'On this page'
// A heading counts as the current section once it passes this line: below the
// 60px bar and past the 84px scroll margin a TOC jump leaves it at.
const CURRENT_SECTION_LINE_PX = 120

const tocLink = tv({
  base: 'block py-[3px] pr-2 transition-[color,box-shadow] duration-150 ease-out hover:text-primary motion-reduce:transition-none',
  variants: {
    level: { 2: 'pl-3', 3: 'pl-6' },
    current: {
      true: 'text-primary shadow-[inset_2px_0_0_var(--color-accent)]',
      false: 'text-muted shadow-[inset_1px_0_0_var(--color-edge)]',
    },
  },
})

const inlineLink = tv({
  base: 'block py-1 text-secondary hover:text-primary',
  variants: { level: { 2: '', 3: 'pl-3.5' } },
})

export function DocsToc({ toc }: DocsTocProps) {
  const currentId = useCurrentSectionId(toc)
  if (toc.length === 0) return null
  return (
    <nav
      aria-label={TITLE}
      className="sticky top-[60px] hidden max-h-[calc(100vh-60px)] overflow-y-auto py-11 text-[13px] min-[1081px]:block"
    >
      <b className="mb-2 block font-medium text-primary">{TITLE}</b>
      <ul>
        {toc.map((entry) => {
          const current = entry.id === currentId
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={ariaCurrent(current)}
                className={tocLink({ level: entry.level, current })}
              >
                {entry.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function DocsTocInline({ toc }: DocsTocProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  if (toc.length === 0) return null

  function closeOnLinkClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('a') === null || detailsRef.current === null)
      return
    detailsRef.current.open = false
  }

  return (
    <details
      ref={detailsRef}
      className="group mb-7 rounded-pane border border-line bg-pane text-[14px] min-[1081px]:hidden"
    >
      <summary className="flex cursor-pointer list-none justify-between rounded-pane px-4 py-3 font-medium text-primary [&::-webkit-details-marker]:hidden">
        {TITLE}
        <span aria-hidden="true" className="font-mono text-accent">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>
      <ul onClick={closeOnLinkClick} className="px-4 pb-3">
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={inlineLink({ level: entry.level })}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

function useCurrentSectionId(toc: Array<TocEntry>): string | undefined {
  const [currentId, setCurrentId] = useState<string>()

  useEffect(() => {
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((heading) => heading !== null)
    if (headings.length === 0) return

    function markCurrentSection() {
      setCurrentId(currentSectionOf(headings).id)
    }

    markCurrentSection()
    window.addEventListener('scroll', markCurrentSection, { passive: true })
    window.addEventListener('resize', markCurrentSection)
    return () => {
      window.removeEventListener('scroll', markCurrentSection)
      window.removeEventListener('resize', markCurrentSection)
    }
  }, [toc])

  return currentId
}

function ariaCurrent(current: boolean): 'location' | undefined {
  if (current) return 'location'
  return undefined
}

function currentSectionOf(headings: Array<HTMLElement>): HTMLElement {
  if (isScrolledToBottom()) return headings[headings.length - 1]
  const passed = headings.filter(
    (heading) => heading.getBoundingClientRect().top < CURRENT_SECTION_LINE_PX,
  )
  return passed.at(-1) ?? headings[0]
}

function isScrolledToBottom(): boolean {
  const { scrollHeight } = document.documentElement
  if (scrollHeight <= window.innerHeight) return false
  return window.scrollY + window.innerHeight >= scrollHeight - 1
}
