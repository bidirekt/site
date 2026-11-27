type ArrowProps = { direction: 'right' | 'external' }

const PATH: Record<ArrowProps['direction'], string> = {
  right: 'M3 8h10M9 4l4 4-4 4',
  external: 'M5 11l6-6M6 5h5v5',
}

export function Arrow({ direction }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="ml-1 inline-block size-[0.85em] align-[-0.05em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATH[direction]} />
    </svg>
  )
}
