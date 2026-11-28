import { TOKEN_CLASS, yamlLine, yamlSegmentKind } from '#/highlight'

export function YamlBlock({ yaml }: { yaml: string }) {
  return (
    <pre className="m-0 py-3 font-mono text-[13px] leading-[1.75]">
      {yaml.split('\n').map((line, index) => (
        <span
          key={index}
          className="block px-4 whitespace-pre-wrap [overflow-wrap:anywhere]"
        >
          {yamlLine(line).map((segment, segmentIndex) => (
            <span
              key={segmentIndex}
              className={
                TOKEN_CLASS[yamlSegmentKind(segment.tone, segment.text)]
              }
            >
              {segment.text}
            </span>
          ))}
        </span>
      ))}
    </pre>
  )
}
