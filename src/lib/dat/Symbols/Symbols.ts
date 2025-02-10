
export const Symbols = new Map([
  ["High", `<span style="color:var(--connection-color-on);">high</span>`],
  ["Low", `<span style="color:var(--connection-color-off);">low</span>`],
  ["1", `<span style="color:var(--connection-color-on);">1</span>`],
  ["0", `<span style="color:var(--connection-color-off);">0</span>`],
  ["2", `<span style="color:var(--connection-color-on);">2</span>`],
  ["Circuit", `<span style="color:var(--circuit-color);">circuit</span>`],
  ["Signal", `<span style="color:var(--circuit-color);">signal</span>`],
  ["Options", `<a href="/options">Options</a>`]
])

export const TruthTableMacro = /BeginTruthTable\((.*)\)EndTruthTable/s