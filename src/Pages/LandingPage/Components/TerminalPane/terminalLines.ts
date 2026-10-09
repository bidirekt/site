export type Tone = 'plain' | 'failure' | 'success' | 'muted'
export type TerminalLine = {
  text: string
  tone: Tone
  command?: boolean
  hint?: string
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
  { text: '  GET /pets/*', tone: 'plain' },
  { text: '    response 200:', tone: 'plain' },
  {
    text: '      - petstore_web reads "$.status", but petstore_api doesn\'t provide it → ',
    tone: 'failure',
    hint: 'stop reading it, or mark it optional',
  },
  {
    text: '      - petstore_web reads "$.weight" as string, but petstore_api provides integer → ',
    tone: 'failure',
    hint: 'read it as integer',
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
