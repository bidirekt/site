import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

export const pane = tv({
  slots: {
    root: 'flex min-w-0 flex-col border border-line bg-pane',
    body: 'p-4',
    statusBar:
      'flex items-center gap-2 border-t border-line px-3 py-1.5 text-[12px] leading-[1.6] text-muted',
  },
})

type PaneProps = {
  status?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Pane({
  status,
  className,
  bodyClassName,
  children,
}: PaneProps) {
  const slots = pane()
  return (
    <section className={slots.root({ className })}>
      <div className={slots.body({ className: bodyClassName })}>{children}</div>
      {status !== undefined && (
        <footer className={slots.statusBar()}>{status}</footer>
      )}
    </section>
  )
}
