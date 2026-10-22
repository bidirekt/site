import { DocsSearch } from './Components/DocsSearch'

type DocsTopBarProps = {
  navOpen: boolean
  onToggleNav: () => void
}

export function DocsTopBar({ navOpen, onToggleNav }: DocsTopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/62 px-4 backdrop-blur-[12px] backdrop-saturate-[1.4]">
      <div className="mx-auto flex h-[60px] w-full max-w-[1360px] items-center gap-4">
        <div className="flex items-center gap-2.5 text-[17px] tracking-[-0.01em] whitespace-nowrap">
          <a
            href="/"
            className="pressable flex items-center gap-2.5 font-semibold text-primary hover:text-accent"
          >
            <span aria-hidden="true" className="text-[20px] leading-none">
              🤝
            </span>
            bidirekt
          </a>
          <a href="/docs" className="pressable text-muted hover:text-primary">
            / docs
          </a>
        </div>
        <DocsSearch />
        <a
          href="/contact"
          className="pressable hidden text-[14px] whitespace-nowrap text-secondary hover:text-primary md:block"
        >
          contact
        </a>
        <a
          href="https://github.com/bidirekt/site"
          target="_blank"
          rel="noreferrer"
          className="pressable hidden text-[14px] whitespace-nowrap text-secondary hover:text-primary md:block"
        >
          github ↗
        </a>
        <button
          type="button"
          onClick={onToggleNav}
          className="pressable cursor-pointer rounded-md border border-line px-2 py-[3px] font-mono text-[13px] text-secondary hover:bg-hover hover:text-primary md:hidden"
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
