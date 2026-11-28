import type { ReactNode } from 'react'

type Question = { question: string; answer: ReactNode }

const LINK =
  'text-primary underline decoration-accent underline-offset-[3px] hover:text-accent'

const QUESTIONS: Array<Question> = [
  {
    question: 'Do I have to rewrite my OpenAPI spec?',
    answer:
      'No. Your OpenAPI document stays as it is. The Bidirekt contract is a separate, smaller YAML file: only the endpoints and fields each side actually uses, in the same format on both sides. It is not generated from OpenAPI today.',
  },
  {
    question: 'How do I keep the YAML honest with the real code?',
    answer: (
      <>
        Generate it from the code instead of writing it by hand. The Bidirekt
        agent skill reads your service and writes its contract files, and fixes
        them from a can-i-deploy report. The{' '}
        <a href="/docs/contracts/typescript-sdk/" className={LINK}>
          TypeScript SDK
        </a>
        , for TypeScript or JavaScript, the{' '}
        <a href="/docs/contracts/php-sdk/" className={LINK}>
          PHP SDK
        </a>{' '}
        and the{' '}
        <a href="/docs/contracts/go-sdk/" className={LINK}>
          Go SDK
        </a>{' '}
        write the contract file from your annotated code.
      </>
    ),
  },
  {
    question: 'Do I need to host the broker?',
    answer:
      'Yes, it is self-hosted: one Docker image and a Postgres database. One admin, created on the first access, invites users by email with read or write permission, and every API call needs a token of one of those users. Serve it over HTTPS from a reverse proxy.',
  },
  {
    question: 'What is the license?',
    answer:
      'The broker is source-available under BSL 1.1: you may run it in production, as long as you do not offer it to others as a competing product or service. Each version becomes Apache 2.0 four years after its release. The CLI and this site are Apache 2.0, and the SDKs are MIT.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-12 py-16 max-[820px]:grid-cols-[minmax(0,1fr)] max-[820px]:gap-4 min-[721px]:py-[88px]"
    >
      <h2
        id="faq-title"
        className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] font-semibold tracking-[-0.03em]"
      >
        Questions
      </h2>
      <div>
        {QUESTIONS.map(({ question, answer }, index) => (
          <details
            key={question}
            open={index === 0}
            className="group border-t border-line last:border-b"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium hover:text-white [&::-webkit-details-marker]:hidden">
              {question}
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-[18px] shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-45 group-open:text-primary motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
            </summary>
            <div className="max-w-[62ch] pb-6 text-[15.5px] text-secondary">
              {answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
