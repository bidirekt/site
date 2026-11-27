import { FlowDiagram } from '../FlowDiagram'
import { SectionHeading } from '../SectionHeading'

export function WhatItIs() {
  return (
    <section
      aria-labelledby="what-title"
      className="py-16 min-[721px]:py-[88px]"
    >
      <SectionHeading
        id="what-title"
        title="One file per service, one answer per deploy"
        lede="Each service declares what it provides and what it reads. The broker you host compares them and answers before the deploy; CI uses the exit code of can-i-deploy as the gate."
      />
      <FlowDiagram />
    </section>
  )
}
