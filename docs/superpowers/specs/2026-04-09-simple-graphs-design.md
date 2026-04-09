# Simple Graphs — Design Spec

**Date:** 2026-04-09
**Status:** Approved for planning

## Goal

A WordPress plugin providing a single Gutenberg block (`simple-graphs/chart`) that lets non-technical users create visually-striking percentage charts. Priority is visual impact and simplicity over analytical depth. Inspired by the chart layouts shown in [Building a chart design tool with Claude](https://woodesignthings.wordpress.com/2026/04/09/building-a-chart-design-tool-with-claude/).

## Scope

- **Single series, parts-of-whole**, 1–8 data items
- Values are percentages (0–100), soft-capped — running total shown, warning over 100%, never hard-blocked
- Six visual variations via block styles: **Column** (default), **Bar**, **Pie**, **Donut**, **Stacked**, **Bubble**
- Per-item: color, optional icon, optional title, numeric value (%)
- Optional chart title above the plot area
- Optional chart background color behind the SVG plot area only (not the whole block)
- SVG rendering, identical in editor and frontend (static save, no PHP render callback)

Explicitly **out of scope**: multi-series, axes/gridlines, tooltips, animations, CSV import, JPG/PNG export (may come later), analytics-grade precision.

## Architecture

### Block registration
- Single block type `simple-graphs/chart`
- Six block styles registered via `registerBlockStyle`: `column` (default), `bar`, `pie`, `donut`, `stacked`, `bubble`
- Chart variation is derived from the `is-style-*` className — no custom type attribute. Users switch via the native Styles panel.

### Attributes

```js
{
  items: [
    { id: string, title: string, value: number, color: string, icon: string | null }
  ],
  chartTitle: string,        // optional heading above chart, default ""
  chartBackground: string    // hex or theme color slug, default "" (transparent)
}
```

- `items`: 1–8 entries. `value` is 0–100 (soft, not clamped). `icon` is a string key resolved against a curated subset of `@wordpress/icons`; `null` means no icon.
- `chartBackground` is a **custom attribute** (not native `color.background`) so it targets only the SVG plot wrapper, not the whole block container.

### Rendering

A single pure `<Chart/>` component routes to one of six variation components based on the resolved style className. Both `edit.js` and `save.js` render the same `<Chart/>`, guaranteeing WYSIWYG.

Shared constants (`charts/shared.js`):
- `BORDER_RADIUS = 6` — applied to Column/Bar/Stacked rectangles and the chart background card
- `LOW_VALUE_THRESHOLD = 4` — values below this use a smaller label variant and are always externally positioned
- System font stack (per the reference post, to avoid web-font loading issues)

### Chart variations

- **Column**: vertical bars, rx=6. Value label above bar, title below, icon inside bar top (or above if too short).
- **Bar**: horizontal bars, rx=6. Title left, value at bar end, icon inside bar start.
- **Pie**: full circle of `path` slices. Labels + icons outside with leader lines, or inside large slices. If total < 100, the remainder renders as a neutral-gray unfilled arc.
- **Donut**: circle with thick `stroke-dasharray` ring (simpler than path math). Center shows chart title or the largest value.
- **Stacked**: single horizontal 100% bar, segments in order, rx=6 on outer corners only. Labels + icons above/below each segment with leader lines for small segments. Neutral-gray trailing segment if total < 100.
- **Bubble**: circles area-proportional to value, packed in a non-overlapping horizontal row. Labels inside large bubbles, below with leader for small ones.

## Sidebar UX (InspectorControls)

**Panel: Chart**
- Chart title — `TextControl`
- Chart background — color picker with theme palette, clearable → transparent

**Panel: Data** (open by default)
- Repeater of items. Each row:
  - Drag handle, color swatch, title preview, value %
  - Expands to: color picker, icon picker (searchable popover grid of `@wordpress/icons` subset, with "None"), title `TextControl`, value `NumberControl` (0–100, step 1)
  - Remove button
- "Add item" button (disabled at 8 items)
- Running total indicator (`Total: 87%`), turns amber with warning icon when > 100. No hard block.

Chart variation lives in the standard Styles panel (block sidebar top), not in Inspector.

## File structure

```
simple-graphs/
├── simple-graphs.php
├── block.json
├── package.json
├── src/
│   ├── index.js                 # registerBlockType + 6 registerBlockStyle
│   ├── edit.js                  # InspectorControls + <Chart/>
│   ├── save.js                  # static save, renders <Chart/>
│   ├── editor.scss
│   ├── style.scss
│   ├── charts/
│   │   ├── Chart.js             # variation router
│   │   ├── Column.js
│   │   ├── Bar.js
│   │   ├── Pie.js
│   │   ├── Donut.js
│   │   ├── Stacked.js
│   │   ├── Bubble.js
│   │   └── shared.js            # constants, helpers, font stack
│   ├── components/
│   │   ├── DataItemsPanel.js
│   │   ├── DataItemRow.js
│   │   └── IconPicker.js
│   └── icons.js                 # curated map of @wordpress/icons (~60)
└── readme.txt
```

Notes:
- `icons.js` exports a hand-picked subset (~60) rather than all ~280 `@wordpress/icons` so the picker stays scannable and the bundle stays lean.
- `Chart.js` is a pure function of `{ items, chartTitle, chartBackground, variation }`, used identically by `edit` and `save`.

## Testing

- Unit tests for chart math helpers in `charts/shared.test.js`: pie angle computation, bubble packing, low-value detection, total computation.
- `@wordpress/scripts` lint + build must pass.
- Manual QA matrix per variation: 1 item, 8 items, totals of 50/100/120, values <4%, long titles, no icon, with/without chart background.
- No PHPUnit — no PHP logic beyond `register_block_type`.

## Non-goals / YAGNI

- No custom type selector — block styles cover it
- No JPG/PNG export (future)
- No animations
- No legends as separate component — labels live with data points
- No tooltips — static infographic, not interactive chart
- No multi-series, axes, or gridlines
