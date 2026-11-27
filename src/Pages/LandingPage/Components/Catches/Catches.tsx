import { SectionHeading } from '../SectionHeading'

type Catch = { title: string; line: string; graphql?: boolean }

const CATCHES: Array<Catch> = [
  {
    title: 'A field the consumer reads is gone',
    line: "Pet.status — petstore_api doesn't provide it, but petstore_web reads it",
  },
  {
    title: 'A type changed',
    line: 'Pet.weight — petstore_web reads it as string, but petstore_api provides integer',
  },
  {
    title: "Null where it isn't accepted",
    line: "Pet.owner — petstore_web doesn't accept null, but petstore_api may provide null",
  },
  {
    title: 'Required on one side, optional on the other',
    line: 'Pet.name — petstore_web requires it, but petstore_api only sometimes provides it',
  },
  {
    title: 'An enum value disappeared',
    line: 'Pet.status — petstore_web reads "sold", but petstore_api doesn\'t provide it',
  },
  {
    title: 'An endpoint was removed',
    line: 'petstore_api removed GET /pets/*, but petstore_web still calls it',
  },
  {
    title: 'A response code changed',
    line: 'petstore_web reads response 200, but petstore_api answers only 204',
  },
  {
    title: "The provider isn't deployed there",
    line: 'petstore_web calls GET /pets/*, but petstore_api is not deployed in production',
  },
  {
    title: 'A GraphQL field is missing',
    line: "petstore_web calls query pet, but petstore_api doesn't provide it",
    graphql: true,
  },
  {
    title: 'A subgraph breaks the graph',
    line: "petstore_web calls query pet, but petstore_graph can't be built in production: …",
    graphql: true,
  },
]

const PARTICIPANT = /(petstore_\w+)/

export function Catches() {
  return (
    <section
      aria-labelledby="catches-title"
      className="py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading
        id="catches-title"
        title="What it catches"
        lede="Every break names the field, the side and the fix. Each line below follows the format can-i-deploy prints, shown with the petstore services."
      />
      <ul className="grid grid-cols-2 border-t border-line max-[820px]:grid-cols-[minmax(0,1fr)]">
        {CATCHES.map(({ title, line, graphql }) => (
          <li
            key={title}
            className="grid content-start gap-1.5 border-b border-line py-5 min-[821px]:odd:border-r min-[821px]:odd:pr-7 min-[821px]:even:pl-7"
          >
            <h3 className="flex flex-wrap items-center gap-2 text-[16px] font-semibold">
              {title}
              {graphql && (
                <span className="rounded-full border border-line px-2 font-mono text-[11px] font-medium text-muted">
                  GraphQL
                </span>
              )}
            </h3>
            <code className="font-mono text-[12.5px] leading-[1.7] text-secondary [overflow-wrap:anywhere]">
              <Highlighted line={line} />
            </code>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Highlighted({ line }: { line: string }) {
  return line.split(PARTICIPANT).map((part, index) => {
    if (PARTICIPANT.test(part)) {
      return (
        <span key={index} className="text-primary">
          {part}
        </span>
      )
    }
    return part
  })
}
