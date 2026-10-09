import { DocsSearch } from './Components/DocsSearch'

type DocsTopBarProps = {
  navOpen: boolean
  onToggleNav: () => void
}

export function DocsTopBar({ navOpen, onToggleNav }: DocsTopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-page px-4">
      <div className="mx-auto flex h-11 w-full max-w-[1360px] items-center gap-4">
        <div className="flex items-center gap-2 text-[14px] whitespace-nowrap">
          <a
            href="/"
            className="flex items-center gap-2 text-primary hover:text-accent"
          >
            <span className="text-[22px] leading-none">🤝</span>
            <span className="text-[20px] font-medium">bidirekt</span>
          </a>
          <a href="/docs" className="text-muted hover:text-primary">
            / docs
          </a>
        </div>
        <DocsSearch />
        <a
          href="/contact"
          className="hidden text-[13px] whitespace-nowrap text-secondary hover:text-primary md:block"
        >
          contact
        </a>
        <a
          href="https://github.com/bidirekt/site"
          target="_blank"
          rel="noreferrer"
          className="hidden text-[13px] whitespace-nowrap text-secondary hover:text-primary md:block"
        >
          github ↗
        </a>
        <button
          type="button"
          onClick={onToggleNav}
          className="cursor-pointer border border-line px-2 py-[3px] text-[13px] text-secondary hover:bg-hover hover:text-primary md:hidden"
        >
          {navToggleLabel(navOpen)}
        </button>
      </div>
    </header>
  )
}

function navToggleLabel(navOpen: boolean): string {
  if (navOpen) return '[ × ]'
  return '[ ≡ ]'
}
