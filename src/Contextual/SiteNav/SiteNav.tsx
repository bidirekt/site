const GITHUB_URL = 'https://github.com/bidirekt'
const NAV_LINK = 'whitespace-nowrap text-secondary hover:text-accent'

export function SiteNav() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex h-[52px] max-w-[1080px] items-center justify-between gap-4 px-6">
        <a
          href="/"
          className="flex items-center gap-2 text-[17px] font-bold whitespace-nowrap text-[#f2f2f2] hover:text-accent"
        >
          <span aria-hidden="true">🤝</span>bidirekt
        </a>
        <div className="flex gap-4 text-[13px] min-[400px]:gap-6">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={NAV_LINK}
          >
            github ↗
          </a>
          <a href="/docs" className={NAV_LINK}>
            docs
          </a>
          <a href="/llms.txt" className={NAV_LINK}>
            llms.txt
          </a>
        </div>
      </nav>
    </header>
  )
}
