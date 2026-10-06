type EditFooterProps = { editUrl: string; markdownHref: string }

export function EditFooter({ editUrl, markdownHref }: EditFooterProps) {
  return (
    <div className="mt-6 flex flex-wrap justify-between gap-4 text-[12px] text-muted">
      <a
        href={editUrl}
        target="_blank"
        rel="noreferrer"
        className="hover:text-accent"
      >
        edit this page on GitHub ↗
      </a>
      <a href={markdownHref} className="hover:text-accent">
        Markdown
      </a>
      <span>bidirekt/site @ main</span>
    </div>
  )
}
