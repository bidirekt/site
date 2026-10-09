import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

export const pane = tv({
  slots: {
    root: 'flex min-w-0 flex-col border border-line bg-pane',
    titleBar:
      'flex items-center gap-2 border-b border-line px-3 py-1.5 text-[12px] leading-[1.6] tracking-[0.08em] text-muted',
    title: 'uppercase',
    titleRight: 'ml-auto normal-case tracking-normal',
    body: 'p-4',
    statusBar:
      'flex items-center gap-2 border-t border-line px-3 py-1.5 text-[12px] leading-[1.6] text-muted',
  },
})

type PaneProps = {
  title?: string
  titleRight?: ReactNode
  status?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Pane({
  title,
  titleRight,
  status,
  className,
  bodyClassName,
  children,
}: PaneProps) {
  const slots = pane()
  return (
    <section className={slots.root({ className })}>
      {title !== undefined && (
        <header className={slots.titleBar()}>
          <span className={slots.title()}>{title}</span>
          {titleRight !== undefined && (
            <span className={slots.titleRight()}>{titleRight}</span>
          )}
        </header>
      )}
      <div className={slots.body({ className: bodyClassName })}>{children}</div>
      {status !== undefined && (
        <footer className={slots.statusBar()}>{status}</footer>
      )}
    </section>
  )
}
