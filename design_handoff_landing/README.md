# Handoff: bidirekt landing page + docs site

## Overview
Marketing landing page for **bidirekt**, a static, bidirectional contract-testing broker (CLI + broker). The page explains the product in three beats: hero with a live terminal demo and an animated handshake, a provider/consumer contract comparison, and the three-step workflow (publish → can-i-deploy → record-deployment).

## About the design files
The `.dc.html` files in this bundle are **design references built in HTML** — they show the intended look and behavior. They are not production code to ship. Recreate them in the target codebase's environment (Next.js/Astro/React/plain HTML — whatever the repo uses; if nothing exists yet, a static site generator like Astro or plain HTML+CSS is the right fit for a landing page). Reuse the codebase's existing tooling; copy the *values* (hex, sizes, spacing, copy text, timings) exactly.

The tokens below are the design-system source of truth for both the landing page and the docs site.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy and animation timings are final. Recreate pixel-accurately.

## Design language in one paragraph
"A terminal that learned layout." Pure black page, near-black panes with 1px hairline borders, monospace everything, no shadows, 2px radius. Brackets instead of badges (`[ publish ]`, `[deployable]`), box-drawing instead of dividers (`──`, `├──`). One amber accent for focus/prompt/primary borders; green and red appear **only as text color** inside report output, exactly like ANSI.

## Design tokens

Colors
- page `#000000` — body background
- pane `#0A0A0A` — panes, code blocks, inputs
- hover `#111111` — hover/selected/active tab background
- border `#1F1F1F` — every 1px border; also `#0F1A12` / `#1A150A` / `#1A0F0F` as +/~/− diff row tints (not used on landing)
- text primary `#EDEDED`, secondary `#A1A1A1`, muted `#6B6B6B`
- accent amber `#F5A524` — `$` prompt, cursor, primary button border/text, link color, hover text on ghost buttons
- success `#3FB950`, failure `#F85149`, warning `#D29922` — text only
- selection: `background #F5A524; color #000`

Typography — `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` (Google Fonts, weights 400/500/600). Body 14px. `-webkit-font-smoothing: antialiased`.
- 40px / 1.15 / 500 / −0.01em — hero h1 (24px on mobile)
- 14px / 1.7 / 400 — body prose, secondary color
- 13px / 1.45 — terminal, report, buttons
- 13px / 1.7 — card prose
- 12px / 1.6 / letter-spacing 0.08em / uppercase — pane title bars, eyebrows, status lines
- 12px / 1.6 — small code inside cards

Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 96. Pane body padding 16; title/status bar padding `6px 12px`; section gap 16; hero padding `96px 24px 64px` (mobile `48px 16px 32px`); sections `48px 24px` (mobile `32px 16px`).

Borders/radius: 1px `#1F1F1F` everywhere; radius 2px; no shadows; focus = border → amber (no outline ring).

Scrollbars: thin, thumb `#1F1F1F`, transparent track (`scrollbar-width: thin; scrollbar-color: #1F1F1F transparent`).

Links: `a { color:#F5A524 }`, `a:hover { color:#EDEDED }`.

## Page structure

Frame: full-width black; content column `max-width: 1040px`, centered. Page is fluid; the design file uses a `viewport` tweak (desktop 1280 / mobile 390) only for preview — implement with real media queries at ~768px.

### 1. Nav (sticky, 44px)
`position: sticky; top: 0; height: 44px; background: #000; border-bottom: 1px solid #1F1F1F; padding: 0 16px; display:flex; align-items:center; gap:16px`.
- Left: `🤝 bidirekt` (emoji 16px, name 14px/500, `#EDEDED`) — links to `/`.
- Spacer.
- Right: `github ↗` (external, `https://github.com/bidirekt`) and `docs ↗` — 13px `#A1A1A1`, hover `#EDEDED`.

### 2. Hero
Grid: `grid-template-columns: minmax(0,1fr) max-content; gap: 32px; align-items: start` (single column on mobile, handshake below copy).

Left column:
- Eyebrow (12px uppercase muted, margin-bottom 24): `── declarative · static · bidirectional contract testing.`
- H1 (40px, max-width 22ch, margin-bottom 24): **Catch the breaking change before it reaches production.**
- Paragraph (14px/1.7 `#A1A1A1`, max-width 64ch, margin-bottom 32): *Both sides declare what they provide and what they consume in one YAML file. The broker compares the declarations against what is deployed and answers `can-i-deploy`, property by property. Nothing has to be running.* (`can-i-deploy` in `<code>` colored `#EDEDED`.)
- Buttons row (gap 8, wrap):
  - Primary `[ read the docs ]` → docs. `border:1px solid #F5A524; color:#F5A524; padding:6px 12px; radius 2px; 13px; background transparent`. Hover: `background:#111111; color:#EDEDED`.
  - Secondary `[ github ↗ ]`. `border:1px solid #1F1F1F; color:#EDEDED`. Hover: `background:#111111; border-color:#A1A1A1`.

Right column — **Handshake pane** (see Animations §B). Pane: `border 1px #1F1F1F; background #0A0A0A; radius 2px; align-self:center; justify-self:end`. Body padding 16, 13px/1.45. Footer bar: `border-top 1px #1F1F1F; padding 6px 12px; gap 12` with ghost buttons `[ pause ]`/`[ play ]` and `[ replay ]` (12px `#6B6B6B`, hover `#F5A524`, no border).

Below the grid, full width, margin-top 48 — **Terminal pane** (see Animations §A):
- Title bar: `── terminal` left, `~/petstore_web` right (12px, right side not uppercase).
- Body: padding 16, 13px/1.45, `min-height: 420px` (360 mobile), lines `white-space: pre-wrap; overflow-wrap:anywhere`. Prompt glyph `$ ` in amber, command text `#EDEDED`.
- Footer/status bar: left = status string, right = ghost `[ replay ]`.

### 3. "Two contracts, one comparison" section
`border-top: 1px solid #1F1F1F`; inner column padding `48px 24px`; `display:flex; flex-direction:column; gap:16px`.

Intro row — grid `repeat(auto-fit, minmax(300px,1fr))`, gap 16, `align-items:end`:
- Col 1: eyebrow `── two contracts, one comparison` + paragraph: *The provider declares what it produces. The consumer declares what it reads. Neither knows about the other; both publish to the broker.*
- Col 2: paragraph: *The broker checks that every required property on the reading side exists, with the same type, on the producing side. Two lines below don't line up — and that is the whole report.*

Panes row — same grid. Each pane: title bar (`── provider · petstore_api` / `── consumer · petstore_web`, right slot `contract.yaml`), `<pre>` body padding 16, 12px/1.6, `white-space: pre-wrap`, `flex:1` so footers align; footer 12px muted.

YAML coloring: keys `#A1A1A1`, colons `#6B6B6B`, values `#EDEDED`. Highlight in red `#F85149`: provider `weight: { type: integer }` (the word `integer`), consumer `weight: { type: string }` (the word `string`) and the trailing comment `# missing in provider` on the consumer's `status` line.

Provider YAML:
```yaml
provides:
  rest:
    "/pets/*":
      get:
        responses:
          "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId: { type: integer }
      name: { type: string }
      weight: { type: integer }
      photoUrl: { type: string }
```
Footer: `produces · extra fields are free`

Consumer YAML:
```yaml
consumes:
  petstore_api:
    rest:
      "/pets/*":
        get:
          responses:
            "200": Pet
schemas:
  Pet:
    type: object
    properties:
      petId: { type: integer }
      name: { type: string }
      weight: { type: string }
      status: { type: string }  # missing in provider
```
Footer: `reads · every required property is a check · 2.3.0` (version in `#A1A1A1`)

Report pane (full width, padding `12px 16px`, 13px/1.6, each line its own block):
```
petstore_web cannot be deployed to production      ← #F85149
                                                    ← blank line
petstore_api (1.4.0):
  GET /pets/*
    response 200:
      - property "$.status" is missing in provider
      - property "$.weight" type mismatch — consumer has string, provider has integer
```

### 4. Three steps
`border-top 1px`; grid `repeat(auto-fit, minmax(280px,1fr))`, gap 16. Each card = pane with flex column; body `padding 16; gap 12`; command block pinned to bottom with `margin-top:auto; border-top 1px #1F1F1F; padding-top 12`; 12px/1.6; command laid out as grid `max-content 1fr` (`$` amber, command wraps under itself); success line `#3FB950`.

1. `── 1 · publish` — *Each participant declares what it provides and what it consumes in one YAML file, and publishes it under a version.*
   `$ bidirekt publish ./contracts/*.yaml` ⏎ `--participant petstore_api --version 1.5.0` → `petstore_api contract publish successful`
2. `── 2 · can-i-deploy` — *Ask before you deploy. The broker compares the new version against what is deployed; the exit code is the gate in CI.*
   `$ bidirekt can-i-deploy petstore_api` ⏎ `--version 1.5.0 --environment production` → `petstore_api can be deployed to production`
3. `── 3 · record-deployment` — *After the deploy succeeds, tell the broker which version now runs where. That is the state the next check compares against.*
   `$ bidirekt record-deployment petstore_api` ⏎ `--version 1.5.0 --environment production` → `petstore_api deployment recorded to production`

### 5. Footer
`border-top 1px; margin-top:auto`; inner padding `16px 24px`; flex space-between; 12px `#6B6B6B`. Left `bidirekt version 0.1.0`; right links `docs`, `github` (gap 16, hover amber).

## Pane anatomy (reused everywhere)
```
┌ title bar: 6px 12px, 12px uppercase 0.08em #6B6B6B, "── name" left, optional right slot ┐
│ body                                                                                     │
└ status bar (optional): 6px 12px, 12px #6B6B6B, border-top 1px                           ┘
```
Border 1px `#1F1F1F`, background `#0A0A0A`, radius 2. **No** filler line between title and right slot (just `flex:1` spacer). No horizontal scroll anywhere — wrap long lines (`pre-wrap` + `overflow-wrap:anywhere`).

## Animations

### A. Terminal demo (hero)
Tick = 40ms. Steps run in sequence; for each step: type the command one character per tick; pause 3 ticks; reveal one output line every 2 ticks; pause 14 ticks; next step. After the last step show an idle prompt `$ ` with a blinking cursor and stop. `[ replay ]` resets to tick 0. Status bar text is per-step: `typing…` while typing, the step's *running* label while output reveals, the step's *done* label after.

Cursor: 8×15px amber block, `vertical-align:-3px`, blink `1s steps(1) infinite` (50% on / 50% off).

Steps (command → output lines → running / done status):
1. `bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production`
   ```
   petstore_web cannot be deployed to production        (red)

   petstore_api (1.4.0):
     GET /pets/*
       response 200:
         - property "$.status" is missing in provider
         - property "$.weight" type mismatch — consumer has string, provider has integer

   ```
   `comparing 2.3.0 against production…` / `exit 1 · 2 breaks · 1 counterpart · 38ms`
2. `$EDITOR contracts/petstore_web.yaml`
   ```
   # Pet.weight  string → integer                        (muted)
   # Pet.status  removed — petstore_api never produced it (muted)

   ```
   `editing…` / `contract fixed`
3. `bidirekt publish ./contracts/*.yaml --participant petstore_web --version 2.3.1`
   → `petstore_web contract publish successful` (green) + blank. `publishing 2.3.1…` / `published petstore_web 2.3.1`
4. `bidirekt can-i-deploy petstore_web --version 2.3.1 --environment production`
   → `petstore_web can be deployed to production` (green) + blank. `comparing 2.3.1 against production…` / `exit 0 · 0 breaks · 1 counterpart · 21ms`
5. `bidirekt record-deployment petstore_web --version 2.3.1 --environment production`
   → `petstore_web deployment recorded to production` (green) + blank. `recording deployment…` / `exit 0 · petstore_web 2.3.1 is now what production runs`

### B. Handshake (hero, right)
Independent clock, tick = 100ms, loops. Labels `provider` (left) and `consumer` (right) on one muted 12px-ish line above a fixed-size stage (~312×88px); caption below centered. **Only the emoji move; the pane, labels and caption never reflow** — position the hands absolutely inside the fixed stage.

Phases (ticks): approach 12 (1.2s) → overlap 3 (0.3s) → shake 15 (1.5s) → success 5 (0.5s) → hold 20 (2s) → reset 3 → loop.
- Approach: 🫱 from left and 🫲 from right, 80px font-size, travel linearly toward center (gap 14 chars → 0), `transition: left 0.1s linear`.
- Overlap: hands keep moving 16px past contact each so they visibly overlap (left hand on top, z-index 1).
- Shake: swap to a single 🤝 centered; every tick alternate `translate(±2px, ∓2px) rotate(±2deg)` with `transition: transform 0.1s ease-in-out`; `filter: drop-shadow(0 0 6px #F5A52488)` (amber glow).
- Success + hold: shake stops, glow becomes green `drop-shadow(0 0 6px #3FB95088)`.
- Caption: `[ can-i-deploy ? ]` muted until success, then `[ deployable ]` in `#3FB950`.
- Controls: `[ pause ]`/`[ play ]` toggles the clock; `[ replay ]` resets to tick 0 and plays.

## Responsive
Breakpoint ~768px: hero becomes one column (handshake below copy, full width), h1 24px, paddings drop to the mobile values above, all grids collapse via `auto-fit`. Nothing scrolls horizontally at any width.

## Interactions summary
- Nav/brand → `/`; `docs` → docs site; `github` → external, `target=_blank rel=noreferrer`.
- Hover states: ghost text → amber; bordered buttons → `#111111` background (+ color change as listed).
- No forms, no data fetching. Two independent animation clocks (terminal, handshake) as described.

## Assets
None besides the emoji 🤝 🫱 🫲 (system emoji font) and the JetBrains Mono webfont. The 🤝 also serves as favicon (inline SVG data URI with the emoji).

---

# Docs site

Reference: `Bidirekt Docs.dc.html` (renders the Markdown in `docs/` via `markdown.js`). Same tokens and pane language as the landing. The content source of truth is the `bidirekt/docs` GitHub repo — render its Markdown files as-is; the `docs/` folder here is a snapshot.

## Layout
Full-width black, **no outer frame borders and no vertical dividers between columns**. Grid `240px minmax(0,1fr) 200px` (sidebar · article · TOC); mobile: single column, sidebar toggled by a `[ ≡ ]` / `[ × ]` button in the top bar.

### Top bar (sticky, 44px, border-bottom 1px)
- `🤝 bidirekt` → landing `/`; `/ docs` (muted) → docs overview.
- Centered search input, max-width 420, height 28: pane background, 1px border (amber on focus), `❯` amber prefix, placeholder `search docs`, `/` hint on the right; pressing `/` anywhere focuses it. Filters the sidebar tree live.
- Right: `github ↗` → `https://github.com/bidirekt/docs`.

### Sidebar (sticky under top bar, `overflow-x: hidden`)
- Heading `── pages` (12px uppercase muted).
- Tree rendered with box-drawing prefixes (`├── `, `│   └── `, `└── `), 13px/1.7. Groups `#EDEDED`, pages `#A1A1A1`, active page `#F5A524`. Hover row `#111111`. Long labels truncate with `…` — never scroll horizontally. Clicking a group collapses it (`▸` suffix when collapsed). **No "(not written yet)" suffixes.**
- Tree: Overview (README) · Concepts { Contract testing, How the broker works, The direction rule } · Contracts { Specification } · Reference { CLI reference } · Guides { Installation, Getting started, CI integration }.
- Footer hint: `↑↓ move  ⏎ open  / search`.

### Article (padding `32px 48px 64px`, prose column max-width 72ch)
- Breadcrumb 12px uppercase muted: `<group> / <page>` (or `docs / Overview`).
- Title 40px/1.15/500 from front-matter `title` (falls back to first `# h1`); description under it 14px/1.7 `#A1A1A1`.
- Body: Markdown rendering rules below.
- Prev/next: two bordered panes side by side (`← previous` / `next →` labels 12px uppercase, page name 13px); hover `#111111` + amber border.
- Under it: `edit this page on GitHub ↗` → `https://github.com/bidirekt/docs/edit/main/<path>`, and `bidirekt/docs @ main` right-aligned, 12px muted.
- Placeholder state (file body is just `> Not written yet.`): a pane titled `── not written yet` showing `$ cat <path>` / `> Not written yet.` plus links to *How the broker works* and *CLI reference*, and a primary button `[ write it on GitHub ]`.

### TOC (right, sticky, desktop only, hidden when empty)
`── on this page`; h2 entries with `├` prefix, h3 indented 16px with `└`; 12px `#A1A1A1`, hover `#EDEDED`; click scrolls with 64px offset.

## Markdown rendering rules (see `markdown.js`)
- **Headings: no `#` marks are shown.** h1 40px (skipped when equal to the page title), h2 24px margin `48px 0 16px`, h3 18px margin `32px 0 12px`; all weight 500, `#EDEDED`, `scroll-margin-top: 72px`, id = slug.
- Paragraphs 14px/1.7 `#A1A1A1`, `text-wrap: pretty`. Inline code: mono, 0.92em, `#EDEDED` on `#111111`, 1px border, radius 2, padding `1px 5px`. Strong `#EDEDED` 600; em `#A1A1A1` italic. Links amber with 1px amber-alpha underline; external links get ` ↗` and open in a new tab; relative `.md` links route in-app.
- Fenced code: pane with title bar `── <lang>` (or `shell`/`text`) and a `[ copy ]` ghost button that reads `[ copied ]` for 1.2s. Body `padding 12px 16px`, 13px/1.45, **`white-space: pre-wrap; overflow-wrap: anywhere` — never horizontal scroll**. Shell lines starting with `$ ` render the `$` amber and the command muted, with a 2ch hanging indent for wrapped lines; output lines `#EDEDED`. YAML: keys `#A1A1A1`, colon `#6B6B6B`, values `#EDEDED`.
- Blockquote: pane with 2px amber left border, `> note` label 12px uppercase muted, content `#EDEDED`.
- Tables: pane, `th` 12px uppercase muted, `td` 13px `#EDEDED` padding `8px 12px`, hairline rows, no zebra. Wrap cells; if a table must scroll, use the thin dark scrollbar.
- Lists: no bullets; unordered items prefixed `├──` / last `└──` in muted, ordered `1.` muted; grid `max-content 1fr`, gap 12, 14px/1.7.
- Horizontal rule: a line of `─` in `#1F1F1F`.
- Front matter (`title`, `description`) is parsed and hidden.

## Scrollbars (both sites)
`scrollbar-width: thin; scrollbar-color: #1F1F1F transparent`; WebKit 6px, thumb `#1F1F1F` radius 3, hover `#333`, transparent track.

## Files in this bundle
- `Bidirekt Landing.dc.html` — the landing page reference
- `Bidirekt Docs.dc.html` + `markdown.js` + `docs/` — the docs site reference and its Markdown renderer/snapshot
- `support.js` — runtime for opening the `.dc.html` files locally; not part of the design
