const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n?/
const QUOTED = /^(["'])(.*)\1$/

export function parseFrontmatter(raw: string): {
  meta: Partial<Record<string, string>>
  body: string
} {
  const match = FRONT_MATTER.exec(raw)
  if (match === null) return { meta: {}, body: raw }
  const meta: Partial<Record<string, string>> = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    meta[key] = stripQuotes(line.slice(separator + 1).trim())
  }
  return { meta, body: raw.slice(match[0].length) }
}

function stripQuotes(value: string): string {
  const quoted = QUOTED.exec(value)
  if (quoted === null) return value
  return quoted[2]
}
