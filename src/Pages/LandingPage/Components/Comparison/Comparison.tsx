import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { SectionHeading } from '../SectionHeading'

type Row = { aspect: string; endToEnd: string; bidirekt: string }

const ROWS: Array<Row> = [
  {
    aspect: 'What has to run',
    endToEnd: 'Every service, a database, seed data',
    bidirekt: 'Nothing: one contract file per service',
  },
  {
    aspect: 'How long',
    endToEnd: 'Minutes, often flaky',
    bidirekt: 'Seconds, same answer every time',
  },
  {
    aspect: 'When it fails',
    endToEnd: 'A timeout or a 500 somewhere',
    bidirekt: 'The field, the side and the fix for each side',
  },
  {
    aspect: 'When you find out',
    endToEnd: 'After deploying to a shared environment',
    bidirekt: 'Before the deploy, as a CI gate',
  },
]

const side = tv({
  slots: {
    root: 'grid content-start gap-5 rounded-pane border p-6',
    title:
      'font-display text-[22px] leading-[1.25] font-semibold tracking-[-0.02em]',
    value: 'text-[16px]',
  },
  variants: {
    ours: {
      true: {
        root: 'border-white/28 bg-pane',
        title: 'text-primary',
        value: 'text-primary',
      },
      false: {
        root: 'border-line',
        title: 'text-secondary',
        value: 'text-secondary',
      },
    },
  },
})

export function Comparison() {
  return (
    <section
      aria-labelledby="why-title"
      className="py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading
        id="why-title"
        title="Drop the end-to-end environment"
        lede="End-to-end tests need every service up, in the right versions, with the right data. Bidirekt checks the same integrations from the files alone."
      />
      <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-[minmax(0,1fr)]">
        <Side
          title="End-to-end integration tests"
          values={ROWS.map((row) => row.endToEnd)}
          ours={false}
        />
        <Side title="Bidirekt" values={ROWS.map((row) => row.bidirekt)} ours>
          <p className="border-t border-line pt-4 text-[14.5px] text-secondary">
            <b className="font-medium text-primary">
              No mocks, no second format.
            </b>{' '}
            REST providers and consumers write the same YAML; a GraphQL provider
            publishes the schema it already has.
          </p>
        </Side>
      </div>
    </section>
  )
}

type SideProps = {
  title: string
  values: Array<string>
  ours: boolean
  children?: ReactNode
}

function Side({ title, values, ours, children }: SideProps) {
  const slots = side({ ours })
  return (
    <div className={slots.root()}>
      <h3 className={slots.title()}>{title}</h3>
      <dl className="grid gap-4">
        {ROWS.map((row, index) => (
          <div key={row.aspect} className="grid grid-cols-[20px_1fr] gap-x-3">
            <dt className="col-start-2 text-[12.5px] font-medium text-muted">
              {row.aspect}
            </dt>
            <dd
              className={`col-span-2 grid grid-cols-subgrid items-center ${slots.value()}`}
            >
              <Mark ours={ours} />
              <span>{values[index]}</span>
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </div>
  )
}

function Mark({ ours }: { ours: boolean }) {
  if (ours) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-4 text-success"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5 6.5 12 13 4.5" />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M4 8h8" />
    </svg>
  )
}
