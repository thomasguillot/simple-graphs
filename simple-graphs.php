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
		register_block_type(
			__DIR__ . '/build/legend',
			array(
				'render_callback' => 'simple_graphs_render_legend',
			)
		);
	}
);

/**
 * Render the legend block on the frontend.
 * Reads sibling data-item blocks from the parent chart's parsed content.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string
 */
function simple_graphs_render_legend( $attributes, $content, $block ) {
	$wrapper_attributes = get_block_wrapper_attributes();
	$items_html         = '';

	// The legend is a child of the chart block. Walk the post content
	// to find the parent chart and extract data-item blocks.
	if ( ! empty( $block->parsed_block ) ) {
		$post    = get_post();
		$blocks  = parse_blocks( $post->post_content );
		$items   = simple_graphs_find_data_items( $blocks, $block->parsed_block );
		foreach ( $items as $item ) {
			$color = '#ccc';
			if ( ! empty( $item['attrs']['style']['color']['background'] ) ) {
				$color = $item['attrs']['style']['color']['background'];
			} elseif ( ! empty( $item['attrs']['backgroundColor'] ) ) {
				$color = 'var(--wp--preset--color--' . $item['attrs']['backgroundColor'] . ')';
			}
			$title       = ! empty( $item['attrs']['title'] ) ? esc_html( $item['attrs']['title'] ) : '';
			$items_html .= sprintf(
				'<div class="simple-graphs-legend__item"><span class="simple-graphs-legend__swatch" style="background:%s"></span><span class="simple-graphs-legend__label">%s</span></div>',
				esc_attr( $color ),
				$title
			);
		}
	}

	return sprintf( '<div %s>%s</div>', $wrapper_attributes, $items_html );
}

/**
 * Recursively find data-item blocks that are siblings of the legend block.
 *
 * @param array $blocks       Parsed blocks array.
 * @param array $legend_block The legend's parsed block.
 * @return array Array of data-item parsed blocks.
 */
function simple_graphs_find_data_items( $blocks, $legend_block ) {
	foreach ( $blocks as $block ) {
		if ( 'simple-graphs/chart' === $block['blockName'] && ! empty( $block['innerBlocks'] ) ) {
			// Check if this chart contains our legend block.
			foreach ( $block['innerBlocks'] as $inner ) {
				if ( 'simple-graphs/legend' === $inner['blockName'] ) {
					// Found the chart — return its data-item children.
					return array_filter(
						$block['innerBlocks'],
						function ( $b ) {
							return 'simple-graphs/data-item' === $b['blockName'];
						}
					);
				}
			}
		}
		// Recurse into inner blocks.
		if ( ! empty( $block['innerBlocks'] ) ) {
			$result = simple_graphs_find_data_items( $block['innerBlocks'], $legend_block );
			if ( ! empty( $result ) ) {
				return $result;
			}
		}
	}
	return array();
}
