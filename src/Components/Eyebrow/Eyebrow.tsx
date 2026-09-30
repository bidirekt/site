import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

export const eyebrow = tv({
  base: 'text-[12px] leading-[1.6] uppercase tracking-[0.08em] text-muted',
})

type EyebrowProps = { className?: string; children: ReactNode }

export function Eyebrow({ className, children }: EyebrowProps) {
  return <p className={eyebrow({ className })}>{children}</p>
}
