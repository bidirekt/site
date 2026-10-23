import { SectionHeading } from '../SectionHeading'

type Row = { aspect: string; endToEnd: string; bidirekt: string }

const LEDE =
  "End-to-end integration tests need every service up, in the right versions, with the right data, and when they fail they tell you only that something broke. Bidirekt checks the same integrations from the files alone. This is contract testing, in both directions: the consumer can't read what the provider doesn't send, and the provider can't drop what a consumer still reads."

const ROWS: Array<Row> = [
  {
    aspect: 'What has to run',
    endToEnd: 'Every service, a database, seed data',
    bidirekt: 'Nothing: one YAML file per service',
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

const HEADER_CELL =
  'bg-raised px-4 py-3 text-left text-[14px] font-medium whitespace-nowrap'
const BODY_CELL = 'border-t border-page px-4 py-3 text-left align-top'

export function Comparison() {
  return (
    <section aria-labelledby="why-title" className="pb-16 md:pb-24">
      <SectionHeading
        id="why-title"
        title="Drop the end-to-end environment"
        lede={LEDE}
      />
      <div className="overflow-x-auto rounded-[10px] bg-pane">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr>
              <th className={`${HEADER_CELL} text-muted`} />
              <th className={`${HEADER_CELL} text-muted`}>
                End-to-end integration tests
              </th>
              <th className={`${HEADER_CELL} text-accent`}>Bidirekt</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.aspect}>
                <th
                  scope="row"
                  className={`${BODY_CELL} font-medium whitespace-nowrap`}
                >
                  {row.aspect}
                </th>
                <td className={`${BODY_CELL} text-secondary`}>
                  {row.endToEnd}
                </td>
                <td className={BODY_CELL}>{row.bidirekt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 max-w-[62ch]">
        <h3 className="mb-1.5 text-[19px] leading-[1.3] font-semibold">
          Both sides write the same file
        </h3>
        <p className="text-secondary">
          Other bi-directional setups compare two different artefacts: an
          OpenAPI document on the provider side and contract files generated
          from mocks on the consumer side. In Bidirekt the provider and the
          consumer write the same YAML format, so there is one thing to learn,
          review and keep honest.
        </p>
      </div>
    </section>
  )
}
