export type LineKind =
  'step' | 'command' | 'output' | 'failed' | 'passed' | 'fix' | 'added'

export type ScriptLine = {
  kind: LineKind
  text: string
  step?: string
  exitCode?: number
}

export const SCRIPT: Array<ScriptLine> = [
  { kind: 'step', text: 'Step 3 of 6 — ', step: 'Publish the proposed change' },
  {
    kind: 'command',
    text: 'bidirekt publish contracts/petstore_api.yaml --participant petstore_api --version 2.0.0',
  },
  { kind: 'output', text: 'petstore_api contract publish successful' },
  { kind: 'step', text: 'Step 4 of 6 — ', step: 'Check it' },
  {
    kind: 'command',
    text: 'bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production',
  },
  {
    kind: 'failed',
    text: 'petstore_api 2.0.0 cannot be deployed to production',
  },
  { kind: 'output', text: '' },
  { kind: 'output', text: 'petstore_web (1.0.0, deployed):' },
  {
    kind: 'output',
    text: "  Pet.status — petstore_api doesn't provide it, but petstore_web reads it",
  },
  { kind: 'fix', text: '    → petstore_api: provide it' },
  {
    kind: 'fix',
    text: '    → petstore_web: stop reading it, or handle its absence in the code and mark it optional there',
  },
  {
    kind: 'output',
    text: '      · GET /pets/* response 200 at "$.status" (petstore_web: Pet.status)',
    exitCode: 1,
  },
  { kind: 'step', text: 'Step 5 of 6 — ', step: 'Fix the contract' },
  { kind: 'command', text: 'vim contracts/petstore_api.yaml' },
  { kind: 'added', text: '+       status:' },
  { kind: 'added', text: '+         type: string' },
  {
    kind: 'command',
    text: 'bidirekt publish contracts/petstore_api.yaml --participant petstore_api --version 3.0.0',
  },
  { kind: 'output', text: 'petstore_api contract publish successful' },
  {
    kind: 'command',
    text: 'bidirekt can-i-deploy petstore_api --version 3.0.0 --environment production',
  },
  { kind: 'passed', text: 'petstore_api 3.0.0 can be deployed to production' },
  { kind: 'output', text: 'compared with: petstore_web', exitCode: 0 },
  { kind: 'step', text: 'In CI — ', step: 'Deploy and record it' },
  { kind: 'command', text: './deploy.sh' },
  {
    kind: 'command',
    text: 'bidirekt record-deployment petstore_api --version 3.0.0 --environment production',
  },
  { kind: 'output', text: 'petstore_api deployment recorded to production' },
]
