export type Tone = 'plain' | 'failure' | 'fix' | 'success' | 'muted'
export type TerminalLine = {
  text: string
  tone: Tone
  command?: boolean
  gapBefore?: boolean
  cursor?: boolean
}

export const TERMINAL_LINES: Array<TerminalLine> = [
  {
    text: 'bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production',
    tone: 'plain',
    command: true,
  },
  {
    text: 'petstore_web 2.3.0 cannot be deployed to production',
    tone: 'failure',
  },
  {
    text: 'petstore_api (1.4.0, deployed):',
    tone: 'plain',
    gapBefore: true,
  },
  {
    text: "  Pet.status — petstore_web reads it, but petstore_api doesn't provide it",
    tone: 'failure',
  },
  {
    text: '    → petstore_web: stop reading it, or handle its absence in the code and mark it optional',
    tone: 'fix',
  },
  { text: '    → petstore_api: provide it', tone: 'fix' },
  { text: '      · GET /pets/* response 200 at "$.status"', tone: 'plain' },
  {
    text: '  Pet.weight — petstore_web reads it as string, but petstore_api provides integer',
    tone: 'failure',
  },
  { text: '    → petstore_web: read it as integer', tone: 'fix' },
  { text: '    → petstore_api: provide it as string there', tone: 'fix' },
  {
    text: '      · GET /pets/* response 200 at "$.weight" (petstore_api: Pet.weight)',
    tone: 'plain',
  },
  {
    text: '$EDITOR contracts/petstore_web.yaml',
    tone: 'plain',
    command: true,
    gapBefore: true,
  },
  { text: '# Pet.weight  string → integer', tone: 'muted' },
  {
    text: "# Pet.status  removed — petstore_api doesn't provide it",
    tone: 'muted',
  },
  {
    text: 'bidirekt publish ./contracts/*.yaml --participant petstore_web --version 2.3.1',
    tone: 'plain',
    command: true,
    gapBefore: true,
  },
  { text: 'petstore_web contract publish successful', tone: 'success' },
  {
    text: 'bidirekt can-i-deploy petstore_web --version 2.3.1 --environment production',
    tone: 'plain',
    command: true,
    gapBefore: true,
  },
  {
    text: 'petstore_web 2.3.1 can be deployed to production',
    tone: 'success',
  },
  { text: 'compared with: petstore_api', tone: 'plain' },
  {
    text: 'bidirekt record-deployment petstore_web --version 2.3.1 --environment production',
    tone: 'plain',
    command: true,
    gapBefore: true,
  },
  {
    text: 'petstore_web deployment recorded to production',
    tone: 'success',
  },
  { text: '', tone: 'plain', command: true, gapBefore: true, cursor: true },
]
