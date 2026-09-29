const GITHUB_URL = 'https://github.com/bidirekt'
const NAV_LINK =
  'whitespace-nowrap text-[13px] text-secondary hover:text-primary'

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-page px-4">
      <div className="mx-auto flex h-11 w-full max-w-[1200px] items-center gap-4">
        <a
          href="/"
          className="flex items-center gap-2 whitespace-nowrap text-[14px] text-primary"
        >
          <span className="text-[16px] leading-none">🤝</span>
          <span className="font-medium">bidirekt</span>
        </a>
        <span className="flex-1" />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className={NAV_LINK}
        >
          github ↗
        </a>
        <a href="/docs" className={NAV_LINK}>
          docs ↗
        </a>
      </div>
    </nav>
  )
}
