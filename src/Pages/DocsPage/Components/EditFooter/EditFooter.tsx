type EditFooterProps = { editUrl: string }

export function EditFooter({ editUrl }: EditFooterProps) {
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
      <span>bidirekt/docs @ main</span>
    </div>
  )
}
