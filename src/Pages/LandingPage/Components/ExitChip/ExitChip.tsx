import { tv } from 'tailwind-variants'

const exitChip = tv({
  base: 'rounded-full px-2 py-0.5 font-mono text-[12px] font-medium',
  variants: {
    success: {
      true: 'bg-success/12 text-success',
      false: 'bg-failure-bg text-failure',
    },
  },
})

export function ExitChip({ code }: { code: number }) {
  return <span className={exitChip({ success: code === 0 })}>exit {code}</span>
}
