#!/bin/bash
#
# Build a distributable zip of Simple Graphs for uploading to a WordPress site.
#
# Usage: ./bin/build-zip.sh
# Output: simple-graphs.zip in the project root

set -euo pipefail

PLUGIN_SLUG="simple-graphs"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/.zip-build"
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")

echo "Building $PLUGIN_SLUG v$VERSION..."

# Clean previous build
rm -rf "$BUILD_DIR" "$ROOT_DIR/$PLUGIN_SLUG.zip"
mkdir -p "$BUILD_DIR/$PLUGIN_SLUG"

# Install and build
cd "$ROOT_DIR"
npm ci --silent
npm run build

# Copy plugin files (no src, no node_modules, no dev files)
cp -r build "$BUILD_DIR/$PLUGIN_SLUG/"
cp simple-graphs.php "$BUILD_DIR/$PLUGIN_SLUG/"

# Generate readme.txt from README.md
cat > "$BUILD_DIR/$PLUGIN_SLUG/readme.txt" <<EOF
=== Simple Graphs ===
Contributors: thomasguillot
Tags: block, chart, gutenberg, infographic, graphs
Requires at least: 6.4
Tested up to: 6.9.4
Stable tag: $VERSION
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create simple, visually-striking charts.

== Description ==

$(sed -n '/^## Features/,/^## Requirements/{/^## Requirements/d;p;}' README.md \
  | sed 's/^## Features//' \
  | sed 's/^- \*\*\(.*\)\*\*/= \1 =/' \
  | sed 's/^— //' \
  | sed '/^$/d')

== Installation ==

1. Upload the \`simple-graphs\` folder to \`/wp-content/plugins/\`.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Insert the "Simple Graphs" block in any post or page.

== Changelog ==

= $VERSION =
* Initial release.
EOF

# Create zip
cd "$BUILD_DIR"
zip -rq "$ROOT_DIR/$PLUGIN_SLUG.zip" "$PLUGIN_SLUG"

# Clean up
rm -rf "$BUILD_DIR"

echo "✓ $PLUGIN_SLUG.zip created (v$VERSION)"
