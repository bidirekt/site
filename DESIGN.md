---
name: Bidirekt
description: Know which service your deploy breaks. Contract testing in both directions, without the test environment.
colors:
  accent: '#ffffff'
  page: '#000000'
  pane: '#0a0a0a'
  raised: '#141414'
  hover: '#171717'
  edge: '#262626'
  line: 'rgba(255, 255, 255, 0.08)'
  sheen: 'rgba(255, 255, 255, 0.04)'
  primary: '#ededed'
  secondary: '#a1a1a1'
  muted: '#8a8a8a'
  success: '#3fb950'
  failure: '#f85149'
  failure-bg: 'rgba(248, 81, 73, 0.12)'
  syntax-keyword: '#c4b5fd'
  syntax-type: '#93c5fd'
  syntax-string: '#fde68a'
  syntax-decorator: '#f9a8d4'
  syntax-number: '#fdba74'
typography:
  display:
    fontFamily: 'Bricolage Grotesque Variable, Geist Sans, system-ui, sans-serif'
    fontSize: 'clamp(44px, 7.4vw, 92px)'
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Bricolage Grotesque Variable, Geist Sans, system-ui, sans-serif'
    fontSize: 'clamp(30px, 4vw, 44px)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  page-title:
    fontFamily: 'Bricolage Grotesque Variable, Geist Sans, system-ui, sans-serif'
    fontSize: 'clamp(34px, 4.6vw, 52px)'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.035em'
  title:
    fontFamily: 'Bricolage Grotesque Variable, Geist Sans, system-ui, sans-serif'
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  lede:
    fontFamily: 'Geist Sans, system-ui, -apple-system, Segoe UI, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'Geist Sans, system-ui, -apple-system, Segoe UI, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Geist Sans, system-ui, -apple-system, Segoe UI, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.45
  code:
    fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.75
  code-label:
    fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '12px'
    fontWeight: 500
rounded:
  inline: '4px'
  tab: '8px'
  control: '10px'
  pane: '12px'
  pill: '9999px'
spacing:
  gutter: '16px'
  pane-inset: '16px'
  section: '64px'
  section-wide: '88px'
  container: '1120px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.page}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 14px'
  button-primary-hover:
    backgroundColor: '{colors.accent}'
  button-secondary:
    backgroundColor: '{colors.pane}'
    textColor: '{colors.primary}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 14px'
  button-secondary-hover:
    backgroundColor: '{colors.hover}'
  button-ghost:
    textColor: '{colors.muted}'
    typography: '{typography.label}'
  pane:
    backgroundColor: '{colors.pane}'
    rounded: '{rounded.pane}'
    padding: '16px'
  tab:
    textColor: '{colors.muted}'
    typography: '{typography.label}'
    rounded: '{rounded.tab}'
    padding: '6px 12px'
  tab-selected:
    backgroundColor: '{colors.raised}'
    textColor: '{colors.primary}'
  copy-command:
    backgroundColor: '{colors.pane}'
    textColor: '{colors.primary}'
    rounded: '{rounded.control}'
    padding: '10px 16px'
  exit-chip-failure:
    backgroundColor: '{colors.failure-bg}'
    textColor: '{colors.failure}'
    typography: '{typography.code-label}'
    rounded: '{rounded.pill}'
    padding: '2px 8px'
  exit-chip-success:
    textColor: '{colors.success}'
    typography: '{typography.code-label}'
    rounded: '{rounded.pill}'
    padding: '2px 8px'
---

# Design System: Bidirekt

## Overview

**Creative North Star: "The Verdict on Black"**

The developer-tool category standard, played straight and finished to a high craft bar. A pure black ground, near-black panes edged by hairlines, near-white type, and nothing that glows. The product proves itself with real artefacts: YAML contracts shown as diffs, `can-i-deploy` reports with their exit codes, real SDK code. Decoration never stands in for evidence.

Density is calm on the marketing surface (wide section padding, centered hero, one 1120px column) and tighter inside panes, where monospace text runs at 13px with generous line height so a report reads like a terminal. Docs share every token and component; they only swap the centered marketing column for a sidebar, article and table of contents.

Color carries meaning only once: green and red belong to the deploy verdict. Everything else is a step on the grey ladder, with white as the single accent for focus, selection, active state and link underlines.

**Key Characteristics:**

- Pure black page, near-black panes, 1px translucent white hairlines.
- White is the only accent; no hue outside the verdict pair.
- Bricolage Grotesque for headings, Geist Sans for prose and controls, Geist Mono for anything a machine reads.
- Real contracts and real command output as the imagery.
- Flat depth: tonal steps plus a 1px inner top sheen, no drop shadows.

## Colors

A neutral grey ladder on pure black, one white accent, and a green/red pair reserved for verdicts.

### Primary

- **Signal White** (accent): focus outlines, text selection, link underlines and link hover, the active docs sidebar item, the selected command step name, hover fill of the primary button. Never a fill for large areas.

### Neutral

- **Void Black** (page): the page ground, the report side of split panes, translucent sticky headers (80% in the site nav, 62% in the docs bar, over a 12px backdrop blur).
- **Pane Black** (pane): panes, the copy-command field, secondary buttons.
- **Raised Graphite** (raised): selected tabs and steps, table header cells, inline code, note blockquotes, code-block headers.
- **Hover Graphite** (hover): hover fill of secondary buttons.
- **Edge Grey** (edge): scrollbar thumb on hover; the solid border step when a hairline is too faint.
- **Hairline** (line): every border and divider, section separators, split-pane seams, the scrollbar thumb.
- **Sheen** (sheen): the 1px inner top highlight on panes and secondary buttons.
- **Ink** (primary): headings, emphasized prose, command text, primary button fill.
- **Smoke** (secondary): body prose, ledes, YAML keys, report text, nav links.
- **Ash** (muted): fine print, captions, unselected tabs, file-name headers, prompt `$`, diff mark for unchanged lines.

### Tertiary

- **Pass Green** (success): the "can be deployed" verdict line, `exit 0` chip (12% tint behind), added diff lines (10% tint behind, green `+`).
- **Break Red** (failure, failure-bg): the "cannot be deployed" verdict line, `exit 1` chip, removed diff lines (tinted row, red `-`, text at 70%), error code blocks in docs.

### Named Rules

**The Verdict-Only Color Rule.** Green and red appear only where a deploy verdict, an exit code, or a contract diff says pass or break. They never decorate a heading, an icon, a button or a status that is not a verdict.

**The Syntax Pastel Rule.** Source code and YAML on the home page and in the docs (TypeScript, JavaScript, PHP, Go, JSON, GraphQL, YAML) are highlighted by one shared tokenizer (`src/highlight.ts`) with five pastel tokens: keywords lavender (`syntax-keyword`), types and schema references blue (`syntax-type`), strings pale yellow (`syntax-string`), decorators and attributes pink (`syntax-decorator`), numbers peach (`syntax-number`); identifiers stay Ink, YAML and JSON keys Smoke, comments Ash, with the `@` tags of a `/** */` comment (`@bidirekt`, `@type`) pink like decorators. Pastels live only inside code panes; never green or red, which stay with verdicts.

**The One White Rule.** The only accent is white. Emphasis comes from moving up the grey ladder (muted, secondary, primary, accent), never from adding a hue.

## Typography

**Display Font:** Bricolage Grotesque Variable (with Geist Sans, system-ui)
**Body Font:** Geist Sans (with system-ui, -apple-system, Segoe UI)
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular, Menlo)

**Character:** A grotesque with some ink-trap personality sets the headlines tight and large; Geist does the reading and the controls quietly; Geist Mono marks every command, file name, contract and report as machine text.

### Hierarchy

- **Display** (700, clamp 44–92px, 0.95, -0.04em): the landing hero headline only, balanced.
- **Page title** (600, clamp 34–52px, 1.05, -0.035em): the h1 of docs articles, contact and privacy pages.
- **Headline** (600, clamp 30–44px, 1.1, -0.03em): landing section headings, balanced.
- **Title** (600, 22–24px, 1.2–1.25, -0.02em): landing sub-headings and the numbered "what it is" cards.
- **Lede** (400, 17px, 19px on the hero above 720px): section intros in Smoke, max 60–62ch, pretty-wrapped.
- **Body** (400, 16px, 1.6; docs prose 1.7, max 70ch): all running text.
- **Label** (500, 14px): buttons, tabs, nav links, table headers.
- **Code** (Geist Mono 400, 13px, 1.75): YAML, reports, SDK code, commands inside panes; 13.5px in docs code blocks.
- **Code label** (Geist Mono 500, 12px): pane headers (file name, `can-i-deploy`), exit chips.

Docs markdown headings below the article title (h2 28px, h3 20px, h4 16px, all 600) are set in Geist Sans, not Bricolage, so long references stay quiet.

### Named Rules

**The Machine Text Rule.** Anything a machine reads or writes (a command, a file name, a YAML line, a report, an exit code) is Geist Mono. Prose about it is Geist Sans.

**The Display Is For Headings Rule.** Bricolage sets page and section headings and the site wordmark, nothing else: never body, buttons or labels.

## Layout

One centered column, `max-width: 1120px`, 16px side gutters at every width. The landing page stacks full-width sections. Sections pad 64px vertically below 721px and 88px above (the hero 64/64 then 112/96). Every section sits on Void Black, divided only by hairlines; no grey bands. Section heading to lede is 12px, lede to content 36px.

Split panes (SDK code beside the generated YAML) run 3:2 and collapse to one column at 900px, the vertical seam becoming a horizontal hairline. The "what it is" diagram switches from a left-to-right layout to a top-to-bottom one below 720px. The comparison table becomes labelled stacked rows below 640px.

Docs use a 1400px frame: sidebar, article (prose max 70ch, blocks max 760px) and a sticky table of contents that appears above 1080px and folds into a disclosure above the article below it; the sidebar becomes a drawer below 820px.

Breakpoints actually used: 380, 480, 640, 720/721, 820/821, 900/901, 1080/1081px. Nothing scrolls horizontally at the page level; long commands and YAML wrap anywhere.

## Elevation & Depth

Flat. Depth is tonal: Void Black page, Pane Black surfaces, Raised Graphite for selected and header cells. The only shadow is a 1px inner top highlight (`inset 0 1px 0` Sheen) on panes and secondary buttons, which reads as a lit edge rather than a lift. Sticky headers float by translucency and a 12px backdrop blur, not by shadow.

### Shadow Vocabulary

- **Sheen** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.04)`): panes and secondary buttons at rest.

### Named Rules

**The No Glow Rule.** No drop shadows, no colored glows, no gradients behind content. A surface is separated from its ground by one tonal step and a hairline.

## Shapes

Softly squared. Panes 12px, controls (buttons, copy field, standalone code snippets) 10px, tabs and step items 8px, inline code 4px, exit chips fully round. Every container carries a 1px Hairline border; dividers inside panes are the same hairline. Arrows are drawn 16px SVG strokes (1.5px, round caps), sized to 0.85em of the text they follow.

## Components

### Buttons

Quiet, compact, label-sized.

- **Shape:** 10px radius, 1px border, 14px/500 label, 8px by 14px (the hero CTA 10px by 16px).
- **Primary:** Ink fill with Void Black text; hover goes to Signal White fill and border.
- **Secondary:** Pane Black fill, Hairline border, Sheen, Ink text; hover to Hover Graphite.
- **Ghost:** bare Ash text that turns Ink on hover and focus.
- **Press:** every pressable scales to 0.97 on active with a 150ms ease-out color and scale transition; hover only fires on fine pointers; reduced motion removes the transition.

### Chips

- **Exit chip:** Geist Mono 12px/500 `exit 0` or `exit 1`, fully round, Pass Green on a 12% green tint or Break Red on the failure tint. It sits right-aligned in a report pane header.

### Cards / Containers

- **Pane:** 12px radius, Hairline border, Pane Black, Sheen; 16px body; optional footer status bar (hairline top, 12px Ash text). Tab strips and file headers sit inside on hairline dividers.
- **Pane header:** Geist Mono 12px Ash, 10px by 16px, hairline bottom, label left and chip or action right.

### Navigation

- **Site nav:** sticky, 80% Void Black with 12px backdrop blur and a hairline bottom; the 🤝 mark plus a lowercase `bidirekt` wordmark in Bricolage 19px/600; lowercase 14px Smoke links (docs, sdks, github with external arrow, llms.txt) that turn Ink; a compact primary "Try it" button. Links drop out progressively at 721px and 480px.
- **Docs bar:** 60px sticky bar, 62% black with blur and saturation; drawer toggle below 820px; search.
- **Docs sidebar:** active item Pane Black with Signal White text.

### Tabs

- **Style:** a wrap-able strip of 14px/500 labels in a hairline-bottomed bar with 8px padding; unselected Ash, hover Ink; selected Raised Graphite fill with Ink text, 8px radius. Below 480px the strip becomes a two-column grid, an odd last tab spanning both. Arrow keys move selection with roving focus.
- **Panel change:** the new panel settles in over 220ms (from 40% opacity and 2px blur, `cubic-bezier(0.23, 1, 0.32, 1)`); off under reduced motion.

### YAML Block

YAML in Geist Mono at 13px/1.75: keys in Smoke, colons in Ash, values in Ink. Lines wrap with their indentation kept; used for the SDK section's generated contract.

### Demo Terminal (signature)

The hero's product panel: a Pane headed by the working folder, the current exit chip, and Pause and Replay controls. It replays the petstore demo on its own: commands type out after an Ash `$` in Ink, step titles in Ash with the step name in Ink sans, verdict lines in Pass Green or Break Red, fix lines (`→`) in Ink, added contract lines in Pass Green, the rest in Smoke. The screen scrolls with the typing so the newest line stays in view; it pauses when off screen and loops after 5s. Under reduced motion it shows the full transcript with no controls.

### Protocol Strip and Brand Icons

A slim row under the hero: "Contracts for" in Ash, then REST, GraphQL and OpenAPI at 22px Bricolage, each led by a 28px icon. Supported protocols are Ink links to their docs; an upcoming one is Ash with a "Soon" pill. Third-party logos (GraphQL, OpenAPI, TypeScript, JavaScript, PHP, Go) come from simple-icons and are always single-color `currentColor`, never their brand colors; REST and the agent skill use drawn 1.5–2px stroke icons. SDK tabs lead each label with its 16px icon. Every icon's viewBox is cropped to its glyph, with a height of √(width × height) (`src/opticalBox.ts`), so at one CSS height a square logo and a wide one (the PHP oval, the Go wordmark) cover the same area.

### Flow Diagram (signature)

The "what it is" panel: an SVG diagram where petstore_api and petstore_web send their contracts to the Bidirekt broker, and the broker's answer gates the deploy arrow into production. Nodes are Pane rectangles with a hairline stroke, Ash mono kicker, Bricolage title and Ink mono detail. Moving wires are dashed and animated (`dash`, 1s linear); the broker and the deploy arrow turn Break Red with "can-i-deploy: no" and "CI stops the deploy", then Pass Green with "yes" and the deploy. Below sit the CLI output of the step and the five steps as buttons. Left-to-right above 720px, top-to-bottom below; reduced motion shows the final step, steps still clickable.

### Copy Command

A 10px, Hairline-bordered Pane Black field: Ash `$`, Ink Geist Mono command, and a hairline-separated "Copy" label button that reads "Copied" for 1.6s or falls back to selecting the text with "Press ⌘C". Full width and wrapping below 480px.

### Links

Ink text with a Signal White underline at 3px offset; hover turns the text Signal White. SDK lists use an Ash underline that brightens to Ink.

## Do's and Don'ts

### Do:

- **Do** separate every surface from its ground with one tonal step plus a 1px Hairline (rgba(255,255,255,0.08)).
- **Do** show the product with real contracts, real `can-i-deploy` output and real SDK code, in Geist Mono.
- **Do** keep green and red to verdicts, exit codes and diff rows.
- **Do** step emphasis up the grey ladder (Ash, Smoke, Ink, Signal White) instead of adding color.
- **Do** keep 16px side gutters and reflow (stack, wrap, relabel) rather than scroll sideways.
- **Do** give every pressable the 0.97 press scale and fine-pointer-only hover.

### Don't:

- **Don't** introduce a second accent hue; white is the only accent.
- **Don't** add drop shadows, glows or gradients; the inner Sheen is the only shadow.
- **Don't** set body, labels or buttons in Bricolage Grotesque.
- **Don't** invent customers, logos, testimonials or usage numbers as social proof.
- **Don't** use icon fonts or emoji as icons; arrows are inline SVG strokes, and the 🤝 mark is the brand mark only.
