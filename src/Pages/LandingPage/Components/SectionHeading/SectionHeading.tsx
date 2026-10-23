import type { ReactNode } from 'react'

type SectionHeadingProps = { id: string; title: string; lede?: ReactNode }

export function SectionHeading({ id, title, lede }: SectionHeadingProps) {
  return (
    <>
      <h2
        id={id}
        className="mb-3 text-[clamp(26px,3.4vw,36px)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance"
      >
        {title}
      </h2>
      {lede !== undefined && (
        <p className="mb-7 max-w-[62ch] text-[17px] text-secondary">{lede}</p>
      )}
    </>
  )
}
