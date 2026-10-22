type EditFooterProps = { editUrl: string; markdownHref: string }

const LINK = 'pressable hover:text-primary'

export function EditFooter({ editUrl, markdownHref }: EditFooterProps) {
  return (
    <div className="mt-6 flex max-w-[760px] flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
      <a href={editUrl} target="_blank" rel="noreferrer" className={LINK}>
        Edit this page on GitHub ↗
      </a>
      <a href={markdownHref} className={LINK}>
        View as Markdown
      </a>
    </div>
  )
}
