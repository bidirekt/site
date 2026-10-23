import type { ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

const SURFACE =
  'rounded-pane border bg-pane px-3.5 py-2 text-[14px] leading-[1.45] font-medium shadow-sheen hover:bg-hover'

export const button = tv({
  base: 'inline-block cursor-pointer whitespace-nowrap pressable',
  variants: {
    variant: {
      primary: `${SURFACE} border-accent/35 text-accent hover:text-primary`,
      secondary: `${SURFACE} border-line text-primary`,
      ghost:
        'bg-transparent p-0 text-[14px] text-muted hover:text-accent focus-visible:text-accent',
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
