import { SectionHeading } from '../SectionHeading'

type Question = { question: string; answer: string }

const QUESTIONS: Array<Question> = [
  {
    question: 'Do I have to rewrite my OpenAPI spec?',
    answer:
      'No. Your OpenAPI document stays as it is. The Bidirekt contract is a separate, smaller YAML file: only the endpoints and fields each side actually uses, in the same format on both sides. It is not generated from OpenAPI today.',
  },
  {
    question: 'How do I keep the YAML honest with the real code?',
    answer:
      'Generate it from the code instead of writing it by hand. The Bidirekt agent skill reads your service and writes its contract files, and fixes them from a can-i-deploy report.',
  },
  {
    question: 'Do I need to host the broker?',
    answer:
      'Yes, it is self-hosted: one Docker image and a Postgres database. It has no authentication yet, so keep it on a private network or behind a proxy that controls who gets in.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading id="faq-title" title="Questions" />
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-12 gap-y-9">
        {QUESTIONS.map(({ question, answer }) => (
          <div key={question}>
            <dt className="mb-1.5 text-[17px] font-medium">{question}</dt>
            <dd className="max-w-[52ch] text-secondary">{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
