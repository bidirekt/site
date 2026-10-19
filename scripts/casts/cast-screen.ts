import { readFile } from 'node:fs/promises'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import xterm from '@xterm/headless'
import type { Plugin } from 'vite'

type CastScreen = { cols: number; lines: Array<string> }

type CastHeader = { width: number; height: number }
type CastEvent = [time: number, code: string, data: string]

const SCREEN_QUERY = '?screen'
// A virtual id: Vite warns on JavaScript imports of files under public/.
const MODULE_PREFIX = '\0cast-screen:'

export function castScreen(): Plugin {
  return {
    name: 'cast-screen',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith(`.cast${SCREEN_QUERY}`)) return null
      const cast = await this.resolve(
        source.slice(0, -SCREEN_QUERY.length),
        importer,
        { skipSelf: true },
      )
      if (cast === null) return null
      return MODULE_PREFIX + cast.id
    },
    async load(id) {
      if (!id.startsWith(MODULE_PREFIX)) return null
      const castPath = id.slice(MODULE_PREFIX.length)
      this.addWatchFile(castPath)
      const screen = await finalScreenFromCast(await readFile(castPath, 'utf8'))
      return `export default ${JSON.stringify(screen)}`
    },
  }
}

async function finalScreenFromCast(cast: string): Promise<CastScreen> {
  const [headerLine, ...eventLines] = cast.trimEnd().split('\n')
  const { width, height } = JSON.parse(headerLine) as CastHeader
  const output = eventLines
    .map((line) => JSON.parse(line) as CastEvent)
    .filter(([, code]) => code === 'o')
    .map(([, , data]) => data)
    .join('')
  const terminal = new xterm.Terminal({
    cols: width,
    rows: height,
    allowProposedApi: true,
  })
  // Unicode 11 widths keep an emoji such as 👉 two cells wide, as a terminal does.
  terminal.loadAddon(new Unicode11Addon())
  terminal.unicode.activeVersion = '11'
  await new Promise<void>((resolve) => terminal.write(output, resolve))
  const buffer = terminal.buffer.active
  const lines = Array.from({ length: height }, (_, row) =>
    (buffer.getLine(buffer.baseY + row)?.translateToString() ?? '').trimEnd(),
  )
  terminal.dispose()
  return { cols: width, lines }
}
