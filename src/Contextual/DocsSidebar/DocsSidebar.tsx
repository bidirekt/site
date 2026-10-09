import { Link } from '@tanstack/react-router'
import { DOCS_TREE, docsLinkProps } from '#/docs'

type DocsSidebarProps = {
  activePath: string
  collapsed: Record<string, boolean>
  onToggleGroup: (label: string) => void
  open: boolean
}

type SidebarRow =
  | { kind: 'group'; label: string; prefix: string; collapsed: boolean }
  | { kind: 'page'; label: string; prefix: string; path: string }

type Position = 'middle' | 'last'

const ROW = 'flex px-3 py-0.5 text-[13px] leading-[1.7] hover:bg-hover'
const PREFIX = 'flex-none whitespace-pre text-muted'
const LABEL = 'min-w-0 truncate'
const BRANCH: Record<Position, string> = { middle: '├── ', last: '└── ' }
const CHILD_INDENT: Record<Position, string> = { middle: '│   ', last: '    ' }
const COLLAPSED_SUFFIX = '  ▸'

export function DocsSidebar({
  activePath,
  collapsed,
  onToggleGroup,
  open,
}: DocsSidebarProps) {
  return (
    <nav
      className={`${visibility(open)} bg-page pt-4 pb-6 md:sticky md:top-11 md:max-h-[calc(100vh-44px)] md:overflow-x-hidden md:overflow-y-auto`}
    >
      <div className="px-3 pt-1 pb-2 text-[12px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
        pages
      </div>
      {sidebarRows(collapsed).map((row) => (
        <SidebarRowView
          key={row.label}
          row={row}
          activePath={activePath}
          onToggleGroup={onToggleGroup}
        />
      ))}
      <div className="mx-3 mt-4 overflow-hidden border-t border-line pt-3 text-[12px] leading-[1.7] whitespace-pre text-muted">
        {'↑↓ move  ⏎ open  / search'}
      </div>
    </nav>
  )
}

type SidebarRowViewProps = {
  row: SidebarRow
  activePath: string
  onToggleGroup: (label: string) => void
}

function SidebarRowView({
  row,
  activePath,
  onToggleGroup,
}: SidebarRowViewProps) {
  if (row.kind === 'group') {
    return (
      <button
        type="button"
        onClick={() => onToggleGroup(row.label)}
        className={`${ROW} w-full cursor-pointer text-left text-primary`}
      >
        <span className={PREFIX}>{row.prefix}</span>
        <span className={LABEL}>{row.label}</span>
        {row.collapsed && <span className={PREFIX}>{COLLAPSED_SUFFIX}</span>}
      </button>
    )
  }
  return (
    <Link
      {...docsLinkProps(row.path)}
      className={`${ROW} ${pageColor(row.path === activePath)}`}
    >
      <span className={PREFIX}>{row.prefix}</span>
      <span className={LABEL}>{row.label}</span>
    </Link>
  )
}

function sidebarRows(collapsed: Record<string, boolean>): Array<SidebarRow> {
  const rows: Array<SidebarRow> = []
  DOCS_TREE.forEach((node, index) => {
    const position = positionOf(index, DOCS_TREE.length)
    const prefix = BRANCH[position]
    if (!('items' in node)) {
      rows.push({ kind: 'page', label: node.label, prefix, path: node.path })
      return
    }
    const isCollapsed = collapsed[node.label] === true
    rows.push({
      kind: 'group',
      label: node.label,
      prefix,
      collapsed: isCollapsed,
    })
    if (isCollapsed) return
    node.items.forEach((item, itemIndex) => {
      const childPosition = positionOf(itemIndex, node.items.length)
      rows.push({
        kind: 'page',
        label: item.label,
        prefix: CHILD_INDENT[position] + BRANCH[childPosition],
        path: item.path,
      })
    })
  })
  return rows
}

function positionOf(index: number, length: number): Position {
  if (index === length - 1) return 'last'
  return 'middle'
}

function pageColor(active: boolean): string {
  if (active) return 'text-accent'
  return 'text-secondary'
}

function visibility(open: boolean): string {
  if (open) return 'block'
  return 'hidden md:block'
}
