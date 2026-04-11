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
		register_block_type(
			__DIR__ . '/build/chart',
			array(
				'render_callback' => 'simple_graphs_render_chart',
			)
		);
		register_block_type( __DIR__ . '/build/data-item' );
		register_block_type( __DIR__ . '/build/legend' );
	}
);

/**
 * Render the chart block on the frontend.
 * Owns rendering of its inner data-item and legend children so it can
 * propagate its own formatting attributes to them.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string
 */
function simple_graphs_render_chart( $attributes, $content, $block ) {
	$value_mode = isset( $attributes['valueMode'] ) ? $attributes['valueMode'] : 'percentage';
	$prefix     = isset( $attributes['valuePrefix'] ) ? $attributes['valuePrefix'] : '';
	$suffix     = isset( $attributes['valueSuffix'] ) ? $attributes['valueSuffix'] : '';

	$inner_blocks = array();
	if ( ! empty( $block->parsed_block['innerBlocks'] ) ) {
		$inner_blocks = $block->parsed_block['innerBlocks'];
	}

	// Collect data-items for legend rendering.
	$items = array();
	foreach ( $inner_blocks as $inner ) {
		if ( 'simple-graphs/data-item' === $inner['blockName'] ) {
			$attrs   = isset( $inner['attrs'] ) ? $inner['attrs'] : array();
			$items[] = array(
				'title' => isset( $attrs['title'] ) ? $attrs['title'] : '',
				'color' => simple_graphs_resolve_color( $attrs ),
			);
		}
	}

	$class_name  = isset( $attributes['className'] ) ? $attributes['className'] : '';
	$is_circular = (bool) preg_match( '/is-style-(pie|donut|bubble)/', $class_name );

	$wrapper = get_block_wrapper_attributes();

	if ( $is_circular ) {
		// Simple fallback rendering for circular charts on frontend.
		// TODO: port SVG rendering from JS to PHP for proper visualization.
		$inner_html = '<div class="simple-graphs-chart__circular-fallback">';
		foreach ( $items as $item ) {
			$inner_html .= sprintf(
				'<div class="simple-graphs-chart__circular-item"><span class="simple-graphs-legend__swatch" style="background:%s"></span><span>%s</span></div>',
				esc_attr( $item['color'] ),
				esc_html( $item['title'] )
			);
		}
		$inner_html .= '</div>';
		return sprintf( '<div %s>%s</div>', $wrapper, $inner_html );
	}

	// Determine zero-gap to apply the no-gap modifier class.
	$block_gap = isset( $attributes['style']['spacing']['blockGap'] ) ? $attributes['style']['spacing']['blockGap'] : '';
	$normalized = trim( str_replace( ' ', '', (string) $block_gap ) );
	$is_zero_gap = in_array( $normalized, array( '0', '0px', '0rem', '0em' ), true );

	$items_class = 'simple-graphs-chart__items';
	if ( $is_zero_gap ) {
		$items_class .= ' simple-graphs-chart__items--no-gap';
	}

	// Render each inner block.
	$inner_html = '';
	foreach ( $inner_blocks as $inner ) {
		$attrs = isset( $inner['attrs'] ) ? $inner['attrs'] : array();
		if ( 'simple-graphs/data-item' === $inner['blockName'] ) {
			$inner_html .= simple_graphs_render_data_item_html( $attrs, $value_mode, $prefix, $suffix );
		} elseif ( 'simple-graphs/legend' === $inner['blockName'] ) {
			$inner_html .= simple_graphs_render_legend_html( $items, $attrs );
		}
	}

	return sprintf(
		'<div %s><div class="%s">%s</div></div>',
		$wrapper,
		esc_attr( $items_class ),
		$inner_html
	);
}

/**
 * Render a single data-item element using the parent chart's formatting.
 *
 * @param array  $attrs      Data-item attributes.
 * @param string $value_mode Chart's value mode (percentage|custom).
 * @param string $prefix     Chart's value prefix.
 * @param string $suffix     Chart's value suffix.
 * @return string
 */
function simple_graphs_render_data_item_html( $attrs, $value_mode, $prefix, $suffix ) {
	$value = isset( $attrs['value'] ) ? $attrs['value'] : '';
	$title = isset( $attrs['title'] ) ? $attrs['title'] : '';
	$color = simple_graphs_resolve_color( $attrs );

	if ( 'percentage' === $value_mode ) {
		$display = $value . '%';
	} else {
		$display = $prefix . $value . $suffix;
	}

	$style = $color ? sprintf( 'background-color:%s;', esc_attr( $color ) ) : '';
	$title_html = $title ? sprintf( '<span class="simple-graphs-data-item__title">%s</span>', wp_kses_post( $title ) ) : '';

	return sprintf(
		'<div class="wp-block-simple-graphs-data-item" style="%s"><span class="simple-graphs-data-item__value">%s</span>%s</div>',
		$style,
		esc_html( $display ),
		$title_html
	);
}

/**
 * Render the legend element using the collected chart items.
 *
 * @param array $items        Items with title and color.
 * @param array $legend_attrs Legend attributes.
 * @return string
 */
function simple_graphs_render_legend_html( $items, $legend_attrs ) {
	$class = 'wp-block-simple-graphs-legend';
	if ( ! empty( $legend_attrs['className'] ) ) {
		$class .= ' ' . $legend_attrs['className'];
	}

	$items_html = '';
	foreach ( $items as $item ) {
		$items_html .= sprintf(
			'<div class="simple-graphs-legend__item"><span class="simple-graphs-legend__swatch" style="background:%s"></span><span class="simple-graphs-legend__label">%s</span></div>',
			esc_attr( $item['color'] ),
			esc_html( $item['title'] )
		);
	}

	return sprintf( '<div class="%s">%s</div>', esc_attr( $class ), $items_html );
}

/**
 * Resolve a color from block attributes (inline style, preset, or fallback).
 *
 * @param array $attrs Block attributes.
 * @return string
 */
function simple_graphs_resolve_color( $attrs ) {
	if ( ! empty( $attrs['style']['color']['background'] ) ) {
		$color = $attrs['style']['color']['background'];
		if ( strpos( $color, 'var:preset|color|' ) === 0 ) {
			$slug = str_replace( 'var:preset|color|', '', $color );
			return 'var(--wp--preset--color--' . $slug . ')';
		}
		return $color;
	}
	if ( ! empty( $attrs['backgroundColor'] ) ) {
		return 'var(--wp--preset--color--' . $attrs['backgroundColor'] . ')';
	}
	return '#ccc';
}
