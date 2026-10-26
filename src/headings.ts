type Heading = { text: string; depth: number }

export function headingIdsOfPage(
  title: string,
): (heading: Heading) => string | null {
  const slugCounts = new Map<string, number>()
  let titleOmitted = false
  return ({ text, depth }) => {
    if (depth === 1 && !titleOmitted && text === title) {
      titleOmitted = true
      return null
    }
    return uniqueSlug(slugCounts, slug(text))
  }
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function uniqueSlug(counts: Map<string, number>, base: string): string {
  const seen = counts.get(base) ?? 0
  counts.set(base, seen + 1)
  if (seen === 0) return base
  return `${base}-${seen}`
}
