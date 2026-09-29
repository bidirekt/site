import { useEffect, useRef } from 'react'

type DocsTopBarProps = {
  query: string
  onQueryChange: (query: string) => void
  navOpen: boolean
  onToggleNav: () => void
}

export function DocsTopBar({
  query,
  onQueryChange,
  navOpen,
  onToggleNav,
}: DocsTopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function focusSearchOnSlash(event: KeyboardEvent) {
      if (event.key !== '/' || isTextField(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', focusSearchOnSlash)
    return () => window.removeEventListener('keydown', focusSearchOnSlash)
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-11 items-center gap-4 border-b border-line bg-page px-4">
      <div className="flex items-center gap-2 text-[14px] whitespace-nowrap">
        <a
          href="/"
          className="flex items-center gap-2 text-primary hover:text-accent"
        >
          <span className="text-[16px] leading-none">🤝</span>
          <span className="font-medium">bidirekt</span>
        </a>
        <a href="/docs" className="text-muted hover:text-primary">
          / docs
        </a>
      </div>
      <label className="flex min-w-0 flex-1 justify-center">
        <span className="flex h-7 w-full max-w-[420px] cursor-text items-center gap-2 rounded-[2px] border border-line bg-pane px-2.5 focus-within:border-accent">
          <span className="text-accent">❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="search docs"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-primary outline-none placeholder:text-muted"
          />
          <span className="hidden text-[12px] text-muted md:block">/</span>
        </span>
      </label>
      <a
        href="https://github.com/bidirekt/docs"
        target="_blank"
        rel="noreferrer"
        className="hidden text-[13px] whitespace-nowrap text-secondary hover:text-primary md:block"
      >
        github ↗
      </a>
      <button
        type="button"
        onClick={onToggleNav}
        className="cursor-pointer rounded-[2px] border border-line px-2 py-[3px] text-[13px] text-secondary hover:bg-hover hover:text-primary md:hidden"
      >
        {navToggleLabel(navOpen)}
      </button>
    </header>
  )
}

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  )
}

function navToggleLabel(navOpen: boolean): string {
  if (navOpen) return '[ × ]'
  return '[ ≡ ]'
}
