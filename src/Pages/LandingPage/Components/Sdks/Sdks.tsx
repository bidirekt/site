import { Arrow } from '#/Components/Arrow'
import { BrandIcon } from '#/Components/BrandIcon'
import type { Brand } from '#/Components/BrandIcon'
import { pane } from '#/Components/Pane'
import { CodeBlock } from '../CodeBlock'
import type { Language } from '#/highlight'
import { SectionHeading } from '../SectionHeading'
import { Tabs } from '../Tabs'
import { YamlBlock } from '../YamlBlock'

type Sdk = {
  name: string
  brand: Brand
  language: Language
  docsHref: string
  file: string
  code: string
  install: Array<string>
  generate: string
  idField: string
}

const SKILL_INSTALL = 'npx skills add bidirekt/skills'

const SDKS: Array<Sdk> = [
  {
    name: 'TypeScript',
    brand: 'typescript',
    language: 'typescript',
    docsHref: '/docs/contracts/typescript-sdk',
    file: 'pets.controller.ts',
    code: `import {
  BidirektField,
  BidirektRestProvider,
  BidirektSchema,
} from '@bidirekt/typescript-sdk'

@BidirektSchema()
export class Pet {
  @BidirektField({ type: 'integer' })
  petId!: number

  @BidirektField()
  name!: string
}

export class PetsController {
  @BidirektRestProvider({
    method: 'GET',
    path: '/pets/*',
    responses: { 200: Pet, 404: null },
  })
  find(petId: string): Pet { … }
}`,
    install: [
      'npm install @bidirekt/typescript-sdk',
      'npm install --save-dev @bidirekt/typescript-sdk-cli',
    ],
    generate: 'npx @bidirekt/typescript-sdk-cli generate',
    idField: 'petId',
  },
  {
    name: 'PHP',
    brand: 'php',
    language: 'php',
    docsHref: '/docs/contracts/php-sdk',
    file: 'src/PetController.php',
    code: `#[BidirektSchema]
final class Pet
{
    public function __construct(
        #[BidirektField] public int $id,
        #[BidirektField] public string $name,
    ) {}
}

final class PetController
{
    #[BidirektProvider(
        method: 'GET',
        path: '/pets/*',
        responses: [200 => Pet::class, 404 => null],
    )]
    public function show(
        Request $request,
        Response $response,
        array $args,
    ): Response { … }
}`,
    install: ['composer require --dev bidirekt/php-sdk'],
    generate: 'vendor/bin/php-sdk generate',
    idField: 'id',
  },
  {
    name: 'Go',
    brand: 'go',
    language: 'go',
    docsHref: '/docs/contracts/go-sdk',
    file: 'pets/pet.go',
    code: `type Pet struct {
	ID   int64  \`json:"id" bidirekt:"field"\`
	Name string \`json:"name" bidirekt:"field"\`
}

var _ = bidirekt.Provides(http.MethodGet, "/pets/*",
	bidirekt.Response(http.StatusOK, pets.Pet{}),
	bidirekt.Response(http.StatusNotFound, nil),
)`,
    install: [
      'go get github.com/bidirekt/go-sdk',
      'go get -tool github.com/bidirekt/go-sdk/cmd/go-sdk',
    ],
    generate: 'go tool go-sdk generate',
    idField: 'id',
  },
]

const HEADER =
  'flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-[12px] text-muted'
const LINK =
  'text-primary underline decoration-muted underline-offset-[3px] hover:decoration-primary'

export function Sdks() {
  return (
    <section
      id="sdks"
      aria-labelledby="sdks-title"
      className="scroll-mt-20 py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading
        id="sdks-title"
        title="Generate the contract from your code"
        lede={
          <>
            Annotate the schemas and handlers your service already has. The SDK
            writes <code>contracts/generated.yaml</code>, ready for{' '}
            <code>bidirekt validate</code> and <code>bidirekt publish</code>.
            Fields you don't annotate stay out of the contract.
          </>
        }
      />
      <Tabs
        label="SDKs"
        className={pane().root({ className: 'overflow-hidden' })}
        tabs={[
          ...SDKS.map((sdk) => ({
            name: sdk.name,
            icon: <BrandIcon brand={sdk.brand} />,
            panel: <SdkPanel sdk={sdk} />,
          })),
          {
            name: 'Agent skill',
            icon: <PromptIcon />,
            panel: <SkillPanel />,
          },
        ]}
      />
    </section>
  )
}

function SdkPanel({ sdk }: { sdk: Sdk }) {
  return (
    <>
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] max-[900px]:grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0 border-r border-line max-[900px]:border-r-0 max-[900px]:border-b">
          <div className={HEADER}>
            <span>{sdk.file}</span>
          </div>
          <CodeBlock code={sdk.code} language={sdk.language} />
        </div>
        <div className="min-w-0">
          <div className={HEADER}>
            <span>contracts/generated.yaml</span>
          </div>
          <YamlBlock yaml={generatedYaml(sdk.idField)} />
        </div>
      </div>
      <div className="grid gap-1 border-t border-line px-4 py-3 font-mono text-[13px] leading-[1.75] text-secondary">
        {[...sdk.install, sdk.generate].map((command) => (
          <span key={command} className="[overflow-wrap:anywhere]">
            <span className="text-muted">$</span> {command}
          </span>
        ))}
        <a href={sdk.docsHref} className={`mt-1 w-fit font-sans ${LINK}`}>
          {sdk.name} SDK docs
          <Arrow direction="right" />
        </a>
      </div>
    </>
  )
}

function SkillPanel() {
  return (
    <div className="grid gap-4 px-4 py-5 text-[15px] text-secondary">
      <p className="max-w-[64ch]">
        For services without an SDK, or to start one: the Bidirekt agent skill
        reads your service and writes its contract files, checks them against
        the broker, and fixes them from a <code>can-i-deploy</code> report. It
        runs only the CLI commands that read, and ends with the{' '}
        <code>publish</code> command for you to run.
      </p>
      <div className="font-mono text-[13px] [overflow-wrap:anywhere]">
        <span className="text-muted">$</span>{' '}
        <span className="text-primary">{SKILL_INSTALL}</span>
      </div>
      <a href="https://github.com/bidirekt/skills" className={`w-fit ${LINK}`}>
        bidirekt/skills on GitHub
        <Arrow direction="external" />
      </a>
    </div>
  )
}

function generatedYaml(idField: string): string {
  return `provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
          404: ~
schemas:
  Pet:
    type: object
    properties:
      ${idField}:
        type: integer
      name:
        type: string`
}

function PromptIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <path d="M3 4.5 6.5 8 3 11.5M8.5 12H13" />
    </svg>
  )
}
