import type { ReactNode } from 'react'
import { BrandIcon } from '#/Components/BrandIcon'

type Protocol = { name: string; icon: ReactNode; href?: string }

const ICON = 'size-7'

const PROTOCOLS: Array<Protocol> = [
  { name: 'REST', icon: <RestIcon />, href: '/docs/rest/resources/' },
  {
    name: 'GraphQL',
    icon: <BrandIcon brand="graphql" className={ICON} />,
    href: '/docs/graphql/resources/',
  },
  {
    name: 'OpenAPI',
    icon: <BrandIcon brand="openapiinitiative" className={ICON} />,
  },
]

const ITEM =
  'flex items-center gap-3 font-display text-[22px] font-semibold tracking-[-0.02em]'

export function Protocols() {
  return (
    <section
      aria-labelledby="protocols-title"
      className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 py-10 min-[721px]:py-12"
    >
      <h2 id="protocols-title" className="text-[15px] text-muted">
        Contracts for
      </h2>
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
        {PROTOCOLS.map((protocol) => (
          <li key={protocol.name}>
            <ProtocolItem protocol={protocol} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProtocolItem({ protocol }: { protocol: Protocol }) {
  if (protocol.href === undefined) {
    return (
      <span className={`${ITEM} text-muted`}>
        {protocol.icon}
        {protocol.name}
        <span className="rounded-full border border-line px-2 py-0.5 font-sans text-[12px] font-medium tracking-normal text-secondary">
          Soon
        </span>
      </span>
    )
  }
  return (
    <a
      href={protocol.href}
      className={`pressable ${ITEM} text-primary hover:text-white`}
    >
      {protocol.icon}
      {protocol.name}
    </a>
  )
}

function RestIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${ICON}`}
    >
      <path d="M3 8h15M14 4l4 4-4 4M21 16H6M10 12l-4 4 4 4" />
    </svg>
  )
}
