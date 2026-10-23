const GITHUB_URL = 'https://github.com/bidirekt'
const NAV_LINK = 'pressable whitespace-nowrap text-secondary hover:text-primary'

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/62 backdrop-blur-[12px] backdrop-saturate-[1.4]">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3">
        <a
          href="/"
          className="pressable flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em] whitespace-nowrap hover:text-accent"
        >
          <span aria-hidden="true" className="text-[20px] leading-none">
            🤝
          </span>
          bidirekt
        </a>
        <div className="flex items-center gap-4 min-[721px]:gap-6">
          <div className="flex gap-4 text-[14px] min-[721px]:gap-6">
            <a href="/docs" className={NAV_LINK}>
              docs
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={NAV_LINK}
            >
              github ↗
            </a>
            <a href="/llms.txt" className={`${NAV_LINK} max-[721px]:hidden`}>
              llms.txt
            </a>
          </div>
          <a
            href="/#try"
            className="pressable rounded-full bg-primary px-3.5 py-1.5 text-[14px] font-medium whitespace-nowrap text-page hover:bg-white"
          >
            Try it
          </a>
        </div>
      </nav>
    </header>
  )
}
