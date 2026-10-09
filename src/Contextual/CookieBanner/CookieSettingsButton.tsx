import type { ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'
import { Button } from '#/Components/Button'
import type { button } from '#/Components/Button'
import { ANALYTICS_ON, openCookieSettings } from './consent'

type CookieSettingsButtonProps = VariantProps<typeof button> & {
  className?: string
  children: ReactNode
}

export function CookieSettingsButton({
  variant,
  className,
  children,
}: CookieSettingsButtonProps) {
  if (!ANALYTICS_ON) return null
  return (
    <Button
      variant={variant}
      className={className}
      onClick={openCookieSettings}
    >
      {children}
    </Button>
  )
}
