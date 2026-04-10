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

add_action(
	'init',
	function () {
		register_block_type( __DIR__ . '/build' );
	}
);
