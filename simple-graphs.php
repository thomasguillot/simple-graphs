<?php
/**
 * Plugin Name: Simple Graphs
 * Description: Create simple, visually-striking charts.
 * Version: 1.0.0
 * Author: Thomas Guillot
 * Author URI: https://thomasguillot.com
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'SIMPLE_GRAPHS_VERSION' ) ) {
	define( 'SIMPLE_GRAPHS_VERSION', '1.0.0' );
}

add_action(
	'init',
	function () {
		$asset_file = __DIR__ . '/build/index.asset.php';
		$version    = SIMPLE_GRAPHS_VERSION;
		if ( file_exists( $asset_file ) ) {
			$asset   = require $asset_file;
			$version = isset( $asset['version'] ) ? $asset['version'] : SIMPLE_GRAPHS_VERSION;
		}

		// Pre-register styles with a file-content-based version so cache busts on update.
		wp_register_style(
			'simple-graphs-chart-style',
			plugins_url( 'build/style-index.css', __FILE__ ),
			array(),
			$version
		);
		wp_register_style(
			'simple-graphs-chart-editor-style',
			plugins_url( 'build/index.css', __FILE__ ),
			array(),
			$version
		);

		register_block_type( __DIR__ . '/build' );
	}
);
