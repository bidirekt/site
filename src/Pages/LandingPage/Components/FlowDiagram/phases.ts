export type Verdict = 'pending' | 'no' | 'yes'

export type Phase = {
  label: string
  durationMs: number
  publishing: Array<'api' | 'web'>
  apiVersion: string
  brokerStatus: string
  verdict: Verdict
  deploying: boolean
  productionApi: string
  output: Array<{ text: string; tone?: 'failed' | 'passed' }>
}

export const PHASES: Array<Phase> = [
  {
    label: 'Publish 2.0.0',
    durationMs: 2600,
    publishing: ['api', 'web'],
    apiVersion: '2.0.0 · without Pet.status',
    brokerStatus: 'comparing contracts…',
    verdict: 'pending',
    deploying: false,
    productionApi: 'petstore_api 1.0.0',
    output: [
      {
        text: '$ bidirekt publish contracts/petstore_api.yaml --participant petstore_api --version 2.0.0',
      },
    ],
  },
  {
    label: 'can-i-deploy: no',
    durationMs: 4200,
    publishing: [],
    apiVersion: '2.0.0 · without Pet.status',
    brokerStatus: 'Pet.status is missing',
    verdict: 'no',
    deploying: false,
    productionApi: 'petstore_api 1.0.0',
    output: [
      {
        text: 'petstore_api 2.0.0 cannot be deployed to production',
        tone: 'failed',
      },
      {
        text: "  Pet.status — petstore_api doesn't provide it, but petstore_web reads it",
      },
    ],
  },
  {
    label: 'Fix and publish 3.0.0',
    durationMs: 2600,
    publishing: ['api'],
    apiVersion: '3.0.0 · provides Pet.status',
    brokerStatus: 'comparing contracts…',
    verdict: 'pending',
    deploying: false,
    productionApi: 'petstore_api 1.0.0',
    output: [
      {
        text: '$ bidirekt publish contracts/petstore_api.yaml --participant petstore_api --version 3.0.0',
      },
    ],
  },
  {
    label: 'can-i-deploy: yes',
    durationMs: 2600,
    publishing: [],
    apiVersion: '3.0.0 · provides Pet.status',
    brokerStatus: 'every field matches',
    verdict: 'yes',
    deploying: false,
    productionApi: 'petstore_api 1.0.0',
    output: [
      {
        text: 'petstore_api 3.0.0 can be deployed to production',
        tone: 'passed',
      },
      { text: 'compared with: petstore_web' },
    ],
  },
  {
    label: 'Deploy',
    durationMs: 5400,
    publishing: [],
    apiVersion: '3.0.0 · provides Pet.status',
    brokerStatus: 'every field matches',
    verdict: 'yes',
    deploying: true,
    productionApi: 'petstore_api 3.0.0',
    output: [
      {
        text: '$ bidirekt record-deployment petstore_api --version 3.0.0 --environment production',
      },
      { text: 'petstore_api deployment recorded to production' },
    ],
  },
]
