# Simple Graphs - Agent Guide

## What this plugin does

A WordPress Gutenberg block plugin for creating charts (Column, Bar, Stacked, Pie, Donut, Bubble) directly in the post editor. Requires a block theme. Charts inherit theme colours, fonts, and spacing via native block supports.

## Block hierarchy

```
simple-graphs/chart          (outer container)
├── simple-graphs/data       (chart track, owns style/format)
│   ├── simple-graphs/data-item  (each data point)
│   ├── simple-graphs/data-item
│   └── ...
└── simple-graphs/legend     (optional, toggled from chart toolbar)
```

## Key files

| File | Purpose |
|------|---------|
| `simple-graphs.php` | Plugin bootstrap, block registration, all PHP render callbacks |
| `src/chart/edit.js` | Chart editor component. Legend toggle, gap, `--sg-radius` propagation |
| `src/chart/block.json` | Chart supports: align, spacing, dimensions, color, border, shadow |
| `src/data/edit.js` | Data editor. Value format toggle, prefix/suffix, bar sizing, track colour |
| `src/data/block.json` | Data supports: spacing, color (skip serialization), border radius (skip serialization). Block styles define chart type |
| `src/data-item/edit.js` | Data item editor. Inline value/label editing, colour handling |
| `src/data-item/block.json` | Data item supports: color (skip serialization) |
| `src/legend/edit.js` | Legend editor. Reads data from sibling Data block's children |
| `src/legend/block.json` | Legend supports: spacing, typography, color, border, shadow, padding |
| `src/shared/utils.js` | Shared helpers: `parseNumeric`, `resolveBlockGap`, `resolveRadius`, `contrastColor`, etc. |
| `src/shared/constants.js` | `BORDER_RADIUS` (6), `LOW_VALUE_THRESHOLD` (4), `NEUTRAL_GRAY` (#E0E0E0) |
| `src/shared/utils.test.js` | Unit tests for shared helpers |

## Block attributes

### Chart (`simple-graphs/chart`)
- Standard block supports only (no custom attributes). Gap default: `--50`.

### Data (`simple-graphs/data`)
- `valueMode` (string, default "percentage") — "percentage" or "custom"
- `valuePrefix` (string) — text before each value in custom mode
- `valueSuffix` (string) — text after each value in custom mode
- `compensateGap` (boolean, default false) — shrink bars to account for spacing
- `style.spacing.blockGap` — gap between items
- `style.border.radius` — flows to all bars and legend swatches via `--sg-radius`
- `style.color.background` / `backgroundColor` — becomes track colour (not block background)
- Block Styles: Column (default), Bar, Pie, Donut, Stacked, Bubble

### Data Item (`simple-graphs/data-item`)
- `value` (string, default "10") — the data value, parsed as number for sizing
- `title` (string) — label shown below the value (hidden when legend is enabled)
- `style.color.background` / `backgroundColor` — bar colour

### Legend (`simple-graphs/legend`)
- Block Styles: Side (default, 20% width), Stack (horizontal)
- Standard typography, colour, padding, border, shadow supports

## CSS custom properties

| Variable | Set on | Purpose |
|----------|--------|---------|
| `--sg-max` | Data wrapper | Maximum value for scaling (100 in percentage mode, data max in custom) |
| `--sg-gap` | Data wrapper | Resolved block gap for spacing calculations |
| `--sg-radius` | Chart wrapper + Data wrapper | Border radius, flows to bars and legend swatches |
| `--sg-value` | Each Data Item | Numeric value for CSS height/width calc |
| `--sg-track` | Data wrapper | Track background colour |
| `--sg-size-base` | Data wrapper | `100%` normally, `calc(100% - gap)` when compensateGap is on |

## HTML structure (frontend)

Each data item renders as:
```html
<div class="wp-block-simple-graphs-data-item" style="--sg-value:40">
  <div class="simple-graphs-data-item__bar" style="background-color:#DB2777;color:#fff">
    <span class="simple-graphs-data-item__value">$40k</span>
    <span class="simple-graphs-data-item__title">Revenue</span>
  </div>
</div>
```

The outer div is the track container (full height in track mode). The inner `.bar` div is the actual coloured bar with the value-based height.

## Colour handling

- **Data block background** → becomes track colour (`--sg-track`), not applied as background
- **Data item colours** → `__experimentalSkipSerialization` on both Data and Data Item. Colours are computed manually and applied to `.simple-graphs-data-item__bar`
- **Neutral gray fallback** → `NEUTRAL_GRAY` constant (JS) / `SIMPLE_GRAPHS_NEUTRAL_GRAY` (PHP), currently `#E0E0E0`
- **Default template colours** → `var(--wp--preset--color--accent)`, `accent-2`, `accent-3` with neutral gray fallback
- **Contrast text** → `contrastColor()` computes black/white from hex luminance. Vars/presets default to white

## PHP rendering

All frontend rendering is in `simple-graphs.php`:
- `simple_graphs_render_chart()` — main render callback, handles legacy block shapes
- `simple_graphs_render_data_html()` — Data wrapper with track/gap/radius
- `simple_graphs_render_data_item_html()` — each bar (outer track div + inner bar div)
- `simple_graphs_render_legend_html()` — legend with full support for typography, colour, padding, border, shadow
- Helper functions: `simple_graphs_resolve_block_gap()`, `simple_graphs_resolve_radius()`, `simple_graphs_resolve_color_value()`, `simple_graphs_contrast_color()`, `simple_graphs_resolve_color()`

## Key patterns

- **Skip serialization**: Data and Data Item blocks use `__experimentalSkipSerialization` for both `color` and `border` supports. This gives us the UI controls but we handle the CSS ourselves.
- **Track mode**: When Data block has a background, `simple-graphs-data--has-track` class makes items stretch full height with the track colour. The bar inside gets value-based height. Not applied to stacked charts.
- **Zero-gap mode**: `simple-graphs-data--no-gap` class. Outer Data wrapper gets border-radius, individual bars lose theirs (except edges: top for column, right for bar).
- **Legend singleton**: Only 1 legend allowed per chart. Hidden from inserter (`inserter: false`), added/removed via Chart toolbar toggle. `allowedBlocks` dynamically filters it out when present.
- **Data block lock**: Data block can't be removed, moved, or unlocked (`lock: { move: true, remove: true }` in template + `supports.lock: false`).

## Testing

```bash
npm test           # 21 unit tests for shared helpers
npm run build      # production build
npm start          # watch mode
```

## Spacing presets used

| Preset | Where | Purpose |
|--------|-------|---------|
| `--50` | Chart block gap default | Space between Data and Legend |
| `--30` | Data block gap default, Legend Stack gap | Space between items |
| `--20` | Legend Side gap, title margin-top | Tighter spacing |
