export type Bounds = [x: number, y: number, width: number, height: number]

// Crops the viewBox to the glyph's width and gives it a height of
// sqrt(width × height), so at one CSS height every glyph covers the same
// area: a square logo fills its box, a wide one is shorter and wider.
export function opticalBox([x, y, width, height]: Bounds) {
  const boxHeight = Math.sqrt(width * height)
  const top = y + (height - boxHeight) / 2
  return {
    viewBox: `${x} ${top} ${width} ${boxHeight}`,
    aspectRatio: `${width} / ${boxHeight}`,
  }
}
