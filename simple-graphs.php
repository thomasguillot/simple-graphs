<?php
/**
 * Plugin Name: Simple Graphs
 * Description: Create simple, visually-striking charts.
 * Version: 2.0.0
 * Author: Thomas Guillot
 * Author URI: https://thomasguillot.com
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'SIMPLE_GRAPHS_VERSION' ) ) {
	define( 'SIMPLE_GRAPHS_VERSION', '2.0.0' );
}

add_action(
	'init',
	function () {
		register_block_type( __DIR__ . '/build/chart' );
		register_block_type( __DIR__ . '/build/data-item' );
		register_block_type( __DIR__ . '/build/legend' );
	}
);
