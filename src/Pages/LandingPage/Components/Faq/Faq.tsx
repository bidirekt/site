import { Eyebrow } from '#/Components/Eyebrow'

type Question = { question: string; answer: string }

const QUESTIONS: Array<Question> = [
  {
    question: 'Do I have to rewrite my OpenAPI spec?',
    answer: '[YOUR ANSWER]',
  },
  {
    question: 'How do I keep the YAML honest with the real code?',
    answer: '[YOUR ANSWER]',
  },
  { question: 'Do I need to host the broker?', answer: '[YOUR ANSWER]' },
]

export function Faq() {
  return (
    <section id="faq" className="flex flex-col gap-5 pt-[88px] pb-24">
      <Eyebrow>faq</Eyebrow>
      <div className="border-t border-line">
        {QUESTIONS.map(({ question, answer }) => (
          <details key={question} className="group border-b border-line">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              {question}
              <span
                aria-hidden="true"
                className="text-accent transition-transform duration-150 ease-[ease] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-[720px] pb-[18px] leading-[1.75] text-secondary">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
