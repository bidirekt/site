import { Eyebrow } from '#/Components/Eyebrow'

const INTRO_LEFT =
  'The provider declares what it produces. The consumer declares what it reads. Neither knows about the other; both publish to the broker.'
const INTRO_RIGHT =
  'The broker checks that every required property on the reading side exists, with the same type, on the producing side. Here every property the consumer reads exists on the provider, with the same type, so the check passes.'

const PROVIDER_YAML = `provides:
  rest:
    "/pets/*":
      get:
        responses:
          "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
      weight:
        type: integer
      photoUrl:
        type: string`

const CONSUMER_YAML = `consumes:
  petstore_api:
    rest:
      "/pets/*":
        get:
          responses:
            "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
      weight:
        type: integer`

const GRID = 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]'

export function ContractsComparison() {
  return (
    <section className="flex flex-col gap-5 py-[72px]">
      <Eyebrow>two contracts, one comparison</Eyebrow>
      <div className={`${GRID} gap-x-8 gap-y-4 leading-[1.75] text-secondary`}>
        <p>{INTRO_LEFT}</p>
        <p>{INTRO_RIGHT}</p>
      </div>
      <div className={`${GRID} gap-3.5`}>
        <ContractPanel label="provider" yaml={PROVIDER_YAML} />
        <ContractPanel label="consumer" yaml={CONSUMER_YAML} />
      </div>
    </section>
  )
}

function ContractPanel({ label, yaml }: { label: string; yaml: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="text-[13px]">{label}</div>
      <div className="flex-1 overflow-x-auto border border-[#262626] bg-pane py-4 text-[12.5px] leading-[1.75]">
        {yaml.split('\n').map((line, index) => (
          <YamlLine key={index} line={line} />
        ))}
      </div>
    </div>
  )
}

function YamlLine({ line }: { line: string }) {
  const keyEnd = line.indexOf(':') + 1
  return (
    <pre className="px-[18px]">
      <span className="text-muted">{line.slice(0, keyEnd)}</span>
      {line.slice(keyEnd)}
    </pre>
  )
}
