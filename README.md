# Simple Graphs

[![License: GPL-2.0](https://img.shields.io/badge/License-GPL--2.0-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)

A WordPress block plugin for creating simple, visually-striking charts. Designed for visual impact over analytical depth — think infographics, not spreadsheets.

## Features

- **Six chart styles** — Column, Bar, Pie, Donut, Stacked, and Bubble, selectable via native block styles.
- **Per-item data** — Each item has a color, optional icon (from `@wordpress/icons`), title, and value.
- **Percentage or custom values** — Use percentage mode (values out of 100) or custom mode with configurable prefix, suffix, and max value.
- **Legend** — Toggleable legend with colored swatches and icons, aligned to the right on a 5/1 grid.
- **Smart defaults** — New items auto-fill the remaining value to reach 100% in percentage mode.
- **Native WordPress controls** — Background color, typography, block spacing, and min-height all use core block supports.
- **Contrast-aware** — Text and icon colors automatically switch between black and white based on background luminance.
- **Gap-aware radius** — Column, Bar, and Stacked charts adapt their border-radius behavior when block spacing is set to zero.

## Requirements

- WordPress 6.4+
- PHP 7.4+

## Installation

```bash
git clone https://github.com/thomasguillot/simple-graphs.git wp-content/plugins/simple-graphs
cd wp-content/plugins/simple-graphs
npm install
npm run build
```

Activate the plugin in **wp-admin > Plugins**, then insert the **Simple Graphs** block in any post or page.

## Development

```bash
npm start      # Watch mode
npm run build  # Production build
npm test       # Run unit tests
npm run lint:js # Lint
```

## License

This project is licensed under the [GNU General Public License v2.0](https://www.gnu.org/licenses/gpl-2.0) or later.
