const GITHUB_URL = 'https://github.com/bidirekt'
const VERSION_LINE = 'bidirekt version 0.1.0'
const FOOTER_LINK = 'hover:text-accent'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-4 text-[12px] text-muted">
        <span>{VERSION_LINE}</span>
        <div className="flex gap-4">
          <a href="/docs" className={FOOTER_LINK}>
            docs
          </a>
          <a href="/llms.txt" className={FOOTER_LINK}>
            llms.txt
          </a>
          <a href="/contact" className={FOOTER_LINK}>
            contact
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={FOOTER_LINK}
          >
            github
          </a>
        </div>
      </div>
    </footer>
  )
}
