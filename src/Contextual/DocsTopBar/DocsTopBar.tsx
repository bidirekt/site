import type { RefObject } from 'react'
import { DocsSearch } from './Components/DocsSearch'

type DocsTopBarProps = {
  navId: string
  navOpen: boolean
  onToggleNav: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function DocsTopBar({
  navId,
  navOpen,
  onToggleNav,
  menuButtonRef,
}: DocsTopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/62 px-4 backdrop-blur-[12px] backdrop-saturate-[1.4]">
      <div className="mx-auto flex h-[60px] w-full max-w-[1400px] items-center gap-4">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls={navId}
          onClick={onToggleNav}
          className="pressable -ml-2 cursor-pointer rounded-md p-2 text-secondary hover:text-primary min-[821px]:hidden"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="block size-5"
          >
            <path
              d="M3 6h14M3 10h14M3 14h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
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
          className="pressable hidden text-[14px] whitespace-nowrap text-secondary hover:text-primary min-[821px]:block"
        >
          contact
        </a>
        <a
          href="https://github.com/bidirekt/site"
          target="_blank"
          rel="noreferrer"
          className="pressable hidden text-[14px] whitespace-nowrap text-secondary hover:text-primary min-[821px]:block"
        >
          github ↗
        </a>
      </div>
    </header>
  )
}
