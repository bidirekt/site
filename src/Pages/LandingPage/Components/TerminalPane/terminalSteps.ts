export type Tone = 'primary' | 'failure' | 'success' | 'muted'
export type Line = { text: string; tone: Tone }
export type Step = {
  command: string
  output: Array<Line>
  running: string
  done: string
}

const BLANK: Line = { text: '', tone: 'primary' }

export const TERMINAL_STEPS: Array<Step> = [
  {
    command:
      'bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production',
    output: [
      {
        text: 'petstore_web 2.3.0 cannot be deployed to production',
        tone: 'failure',
      },
      BLANK,
      { text: 'petstore_api (1.4.0, deployed):', tone: 'primary' },
      { text: '  GET /pets/*', tone: 'primary' },
      { text: '    response 200:', tone: 'primary' },
      {
        text: '      - petstore_web reads "$.status", but petstore_api doesn\'t provide it → stop reading it, or mark it optional',
        tone: 'primary',
      },
      {
        text: '      - petstore_web reads "$.weight" as string, but petstore_api provides integer → read it as integer',
        tone: 'primary',
      },
      BLANK,
    ],
    running: 'comparing 2.3.0 against production…',
    done: 'exit 1 · 2 breaks · 1 counterpart · 38ms',
  },
  {
    command: '$EDITOR contracts/petstore_web.yaml',
    output: [
      { text: '# Pet.weight  string → integer', tone: 'muted' },
      {
        text: '# Pet.status  removed — petstore_api never produced it',
        tone: 'muted',
      },
      BLANK,
    ],
    running: 'editing…',
    done: 'contract fixed',
  },
  {
    command:
      'bidirekt publish ./contracts/*.yaml --participant petstore_web --version 2.3.1',
    output: [
      { text: 'petstore_web contract publish successful', tone: 'success' },
      BLANK,
    ],
    running: 'publishing 2.3.1…',
    done: 'published petstore_web 2.3.1',
  },
  {
    command:
      'bidirekt can-i-deploy petstore_web --version 2.3.1 --environment production',
    output: [
      {
        text: 'petstore_web 2.3.1 can be deployed to production',
        tone: 'success',
      },
      BLANK,
    ],
    running: 'comparing 2.3.1 against production…',
    done: 'exit 0 · 0 breaks · 1 counterpart · 21ms',
  },
  {
    command:
      'bidirekt record-deployment petstore_web --version 2.3.1 --environment production',
    output: [
      {
        text: 'petstore_web deployment recorded to production',
        tone: 'success',
      },
      BLANK,
    ],
    running: 'recording deployment…',
    done: 'exit 0 · petstore_web 2.3.1 is now what production runs',
  },
]
