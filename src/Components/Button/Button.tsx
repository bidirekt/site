import type { ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const button = tv({
  base: 'inline-block cursor-pointer whitespace-nowrap font-mono outline-none',
  variants: {
    variant: {
      primary:
        'rounded-[2px] border border-accent px-3 py-1.5 text-[13px] leading-[1.45] text-accent hover:bg-hover hover:text-primary focus-visible:border-accent',
      secondary:
        'rounded-[2px] border border-line px-3 py-1.5 text-[13px] leading-[1.45] text-primary hover:border-secondary hover:bg-hover focus-visible:border-accent',
      ghost:
        'bg-transparent p-0 text-[12px] text-muted hover:text-accent focus-visible:text-accent',
    },
  },
  defaultVariants: { variant: 'secondary' },
})

type ButtonTarget =
  { href: string; onClick?: never } | { href?: never; onClick: () => void }

type ButtonProps = VariantProps<typeof button> & {
  className?: string
  children: ReactNode
} & ButtonTarget

export function Button({
  variant,
  className,
  children,
  href,
  onClick,
}: ButtonProps) {
  const classes = button({ variant, className })
  if (href === undefined) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {children}
      </button>
    )
  }
  return (
    <a href={href} className={classes} {...externalLinkProps(href)}>
      {children}
    </a>
  )
}

function externalLinkProps(href: string) {
  if (!href.startsWith('http')) {
    return {}
  }
  return { target: '_blank', rel: 'noreferrer' } as const
}
