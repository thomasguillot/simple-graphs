# Simple Graphs

[![License: GPL-2.0](https://img.shields.io/badge/License-GPL--2.0-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)

A WordPress block plugin for creating simple, visually-striking charts. Built on native block supports so charts pick up your theme's colours, fonts, and spacing automatically.

## Features

- **6 chart styles** — Column, Bar, Stacked, Pie, Donut, and Bubble, set as block styles on the Data block.
- **Nested block architecture** — Chart > Data > Data Items, with an optional Legend. Each level has its own controls.
- **Percentage or custom values** — Percentage mode appends %. Custom mode lets you set a prefix and suffix (e.g. "$100k").
- **Track background** — Set a background colour on the Data block and each bar gets a full-height track behind it.
- **Border radius** — Set on the Data block, flows to every bar and legend swatch via a CSS variable.
- **Legend** — Toggle on/off from the Chart toolbar. Side style (fixed 20% width) or Stack (horizontal). Has its own typography, colour, padding, border, and shadow controls. Stacks below the chart on mobile.
- **Visual customisation** — Padding, border, shadow, and background on both the Chart and Legend blocks. Zero-gap mode merges bars into 1 shape.
- **Bar sizing** — Full (default) or Adjusted, which shrinks bars to account for spacing.
- **Contrast-aware text** — Text colour switches between black and white based on background luminance.
- **Theme-aware defaults** — New items use `accent`, `accent-2`, `accent-3` preset colours with a neutral grey fallback.

## Block structure

```
Simple Graphs (Chart)
├── Data
│   ├── Data Item
│   ├── Data Item
│   └── Data Item
└── Legend (optional)
```

- **Chart**: outer wrapper. Controls layout, min-height, padding, background, border, shadow, text colour.
- **Data**: owns the chart style, value format, border-radius, and track background. Has a "Bar sizing" control (Full or Adjusted).
- **Data Item**: each data point. Edit value and label inline, drag to reorder, colour with any theme colour.
- **Legend**: toggled from the Chart toolbar. Side or Stack style. Swatches inherit border-radius from Data.

## Requirements

- WordPress 6.4+
- PHP 7.4+
- A block theme (uses preset spacing and colour tokens)

## Installation

```bash
git clone https://github.com/thomasguillot/simple-graphs.git wp-content/plugins/simple-graphs
cd wp-content/plugins/simple-graphs
npm install
npm run build
```

Activate in **wp-admin > Plugins**, then insert the **Simple Graphs** block.

## Development

```bash
npm start      # Watch mode
npm run build  # Production build
npm test       # Unit tests
npm run lint:js # Lint
```

## License

[GNU General Public License v2.0](https://www.gnu.org/licenses/gpl-2.0) or later.
