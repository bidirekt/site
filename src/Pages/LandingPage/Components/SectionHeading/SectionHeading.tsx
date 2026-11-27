import type { ReactNode } from 'react'

type SectionHeadingProps = { id: string; title: string; lede?: ReactNode }

export function SectionHeading({ id, title, lede }: SectionHeadingProps) {
  return (
    <>
      <h2
        id={id}
        className="mb-3 font-display text-[clamp(30px,4vw,44px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance"
      >
        {title}
      </h2>
      {lede !== undefined && (
        <p className="mb-9 max-w-[62ch] text-[17px] text-pretty text-secondary">
          {lede}
        </p>
      )}
    </>
  )
}
