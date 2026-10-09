import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

export const pane = tv({
  slots: {
    frame: 'flex min-w-0 flex-col gap-2',
    labelRow: 'flex items-center gap-2 text-[13px] leading-[1.6]',
    labelRight: 'ml-auto text-[12px] text-muted',
    root: 'flex min-w-0 flex-col border border-line bg-pane',
    body: 'p-4',
    statusBar:
      'flex items-center gap-2 border-t border-line px-3 py-1.5 text-[12px] leading-[1.6] text-muted',
  },
})

type PaneProps = {
  label?: string
  status?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Pane({
  label,
  status,
  className,
  bodyClassName,
  children,
}: PaneProps) {
  const slots = pane()
  if (label === undefined) {
    return (
      <PaneBox
        className={className}
        bodyClassName={bodyClassName}
        status={status}
      >
        {children}
      </PaneBox>
    )
  }
  return (
    <div className={slots.frame({ className })}>
      <div className={slots.labelRow()}>{label}</div>
      <PaneBox className="flex-1" bodyClassName={bodyClassName} status={status}>
        {children}
      </PaneBox>
    </div>
  )
}

function PaneBox({
  status,
  className,
  bodyClassName,
  children,
}: Omit<PaneProps, 'label'>) {
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
