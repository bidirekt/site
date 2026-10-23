import { useEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { Link } from '@tanstack/react-router'
import { tv } from 'tailwind-variants'
import { DOCS_TREE, docsLinkProps } from '#/docs'
import type { DocsLeaf } from '#/docs'

type DocsSidebarProps = {
  id: string
  activePath: string
  open: boolean
  onNavigate: () => void
}

type Position = 'middle' | 'last'

const START_PATH = 'guides/installation.md'
const START_HASH = 'running-local'
const GLYPH: Record<Position, string> = { middle: '├─', last: '└─' }
const ARROW_STEP: Partial<Record<string, number>> = {
  ArrowDown: 1,
  ArrowUp: -1,
}
const KEY =
  'rounded-[4px] bg-raised px-1.5 py-px font-mono text-[12px] font-medium text-secondary'

// Below 820px the sidebar is a drawer; visibility keeps the closed drawer out
// of the tab order and waits for the closing slide before it hides.
const sidebar = tv({
  base: 'overflow-y-auto py-8 min-[821px]:sticky min-[821px]:top-[60px] min-[821px]:max-h-[calc(100vh-60px)] max-[820px]:fixed max-[820px]:inset-y-0 max-[820px]:left-0 max-[820px]:z-35 max-[820px]:w-[min(300px,86vw)] max-[820px]:bg-page max-[820px]:px-5 max-[820px]:py-6 max-[820px]:shadow-[1px_0_0_var(--color-pane)]',
  variants: {
    open: {
      true: 'max-[820px]:visible max-[820px]:translate-x-0 max-[820px]:[transition:translate_300ms_cubic-bezier(0.32,0.72,0,1),visibility_0s] max-[820px]:motion-reduce:[transition:visibility_0s]',
      false:
        'max-[820px]:invisible max-[820px]:-translate-x-full max-[820px]:[transition:translate_240ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_240ms] max-[820px]:motion-reduce:[transition:visibility_0s]',
    },
  },
})

const treeLink = tv({
  base: 'pressable -ml-2 flex gap-2 rounded-md px-2 py-[3px] hover:bg-pane hover:text-primary',
  variants: {
    active: {
      true: 'bg-pane text-accent',
      false: 'text-secondary',
    },
  },
})

export function DocsSidebar({
  id,
  activePath,
  open,
  onNavigate,
}: DocsSidebarProps) {
  const activeLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (open) activeLinkRef.current?.focus()
  }, [open])

  return (
    <nav
      id={id}
      aria-label="Documentation"
      onKeyDown={moveFocusByArrow}
      onClick={(event) => closeOnLinkClick(event.target, onNavigate)}
      className={sidebar({ open })}
    >
      <Link
        {...docsLinkProps(START_PATH)}
        hash={START_HASH}
        activeOptions={{ exact: true, includeHash: true }}
        className="pressable mb-6 block rounded-pane border border-accent/28 bg-[linear-gradient(180deg,rgba(245,165,36,0.1),var(--color-pane)_70%)] px-3.5 py-3 shadow-sheen hover:bg-raised hover:bg-none"
      >
        <b className="block text-[15px] font-medium text-accent">
          Start in 5 minutes →
        </b>
        <span className="block text-[13px] text-secondary">
          Install the CLI and run a broker on your machine.
        </span>
      </Link>
      <ul className="text-[14px]">
        {DOCS_TREE.map((node, index) => {
          const position = positionOf(index, DOCS_TREE.length)
          if (!('items' in node)) {
            return (
              <li key={node.label}>
                <TreeLink
                  leaf={node}
                  position={position}
                  activePath={activePath}
                  activeLinkRef={activeLinkRef}
                />
              </li>
            )
          }
          return (
            <li key={node.label} className="mt-4">
              <span className="block pb-1 text-[13px] font-medium text-primary">
                {node.label}
              </span>
              <ul>
                {node.items.map((item, itemIndex) => (
                  <li key={item.path}>
                    <TreeLink
                      leaf={item}
                      position={positionOf(itemIndex, node.items.length)}
                      activePath={activePath}
                      activeLinkRef={activeLinkRef}
                    />
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3 text-[12px] text-muted max-[820px]:hidden">
        <span>
          <kbd className={KEY}>↑</kbd> <kbd className={KEY}>↓</kbd> move
        </span>
        <span>
          <kbd className={KEY}>/</kbd> search
        </span>
      </div>
    </nav>
  )
}

type TreeLinkProps = {
  leaf: DocsLeaf
  position: Position
  activePath: string
  activeLinkRef: RefObject<HTMLAnchorElement | null>
}

function TreeLink({
  leaf,
  position,
  activePath,
  activeLinkRef,
}: TreeLinkProps) {
  const active = leaf.path === activePath
  return (
    <Link
      {...docsLinkProps(leaf.path)}
      ref={refWhenActive(active, activeLinkRef)}
      activeOptions={{ exact: true }}
      className={treeLink({ active })}
    >
      <span className="font-mono text-[13px] text-muted">
        {GLYPH[position]}
      </span>
      {leaf.label}
      {leaf.isPlaceholder && (
        <span className="ml-auto text-[11px] text-muted">soon</span>
      )}
    </Link>
  )
}

function refWhenActive(
  active: boolean,
  ref: RefObject<HTMLAnchorElement | null>,
): RefObject<HTMLAnchorElement | null> | undefined {
  if (active) return ref
  return undefined
}

function moveFocusByArrow(event: KeyboardEvent<HTMLElement>) {
  const step = ARROW_STEP[event.key]
  if (step === undefined) return
  const links = Array.from(event.currentTarget.querySelectorAll('a'))
  const current = links.findIndex((link) => link === document.activeElement)
  if (current === -1) return
  event.preventDefault()
  const next = Math.min(Math.max(current + step, 0), links.length - 1)
  links[next].focus()
}

function closeOnLinkClick(target: EventTarget, onNavigate: () => void) {
  if (target instanceof Element && target.closest('a') !== null) onNavigate()
}

function positionOf(index: number, length: number): Position {
  if (index === length - 1) return 'last'
  return 'middle'
}
