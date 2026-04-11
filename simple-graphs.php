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
		register_block_type( __DIR__ . '/build/data' );
		register_block_type( __DIR__ . '/build/data-item' );
		register_block_type( __DIR__ . '/build/legend' );
	}
);

/**
 * Render the chart block on the frontend.
 *
 * Chart is a flex column that stacks a Data block and an optional Legend. The
 * renderer accepts the current shape (data-items nested inside a Data block)
 * and a legacy shape (data-items directly under the chart) by virtually
 * wrapping stray data-items into a synthetic Data block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string
 */
function simple_graphs_render_chart( $attributes, $content, $block ) {
	$inner_blocks = array();
	if ( ! empty( $block->parsed_block['innerBlocks'] ) ) {
		$inner_blocks = $block->parsed_block['innerBlocks'];
	}

	// Normalize: if data-items appear directly (legacy shape), wrap them in a
	// synthetic data block so rendering below can assume the new shape.
	$normalized_inner = array();
	$stray_items      = array();
	foreach ( $inner_blocks as $inner ) {
		if ( 'simple-graphs/data-item' === $inner['blockName'] ) {
			$stray_items[] = $inner;
		} else {
			$normalized_inner[] = $inner;
		}
	}
	if ( ! empty( $stray_items ) ) {
		$synthetic = array(
			'blockName'   => 'simple-graphs/data',
			'attrs'       => array(),
			'innerBlocks' => $stray_items,
		);
		array_unshift( $normalized_inner, $synthetic );
	}

	// Find the first Data block (there should only ever be one) and detect Legend presence.
	$data_block = null;
	$has_legend = false;
	foreach ( $normalized_inner as $inner ) {
		if ( null === $data_block && 'simple-graphs/data' === $inner['blockName'] ) {
			$data_block = $inner;
		} elseif ( 'simple-graphs/legend' === $inner['blockName'] ) {
			$has_legend = true;
		}
	}

	// Value formatting now lives on the Data block.
	$data_attrs = $data_block && isset( $data_block['attrs'] ) ? $data_block['attrs'] : array();
	$value_mode = isset( $data_attrs['valueMode'] ) ? $data_attrs['valueMode'] : 'percentage';
	$prefix     = isset( $data_attrs['valuePrefix'] ) ? $data_attrs['valuePrefix'] : '';
	$suffix     = isset( $data_attrs['valueSuffix'] ) ? $data_attrs['valueSuffix'] : '';

	// Collect data-items from the Data block for legend rendering and max computation.
	$items    = array();
	$data_max = 1.0;
	if ( $data_block && ! empty( $data_block['innerBlocks'] ) ) {
		foreach ( $data_block['innerBlocks'] as $child ) {
			if ( 'simple-graphs/data-item' !== $child['blockName'] ) {
				continue;
			}
			$attrs    = isset( $child['attrs'] ) ? $child['attrs'] : array();
			$raw      = isset( $attrs['value'] ) ? $attrs['value'] : '0';
			$numeric  = (float) str_replace( array( ',', ' ' ), '', (string) $raw );
			$data_max = max( $data_max, $numeric );
			$items[]  = array(
				'title' => isset( $attrs['title'] ) ? $attrs['title'] : '',
				'color' => simple_graphs_resolve_color( $attrs ),
			);
		}
	}
	$sg_max = ( 'percentage' === $value_mode ) ? max( 100.0, $data_max ) : $data_max;

	// Chart wrapper adds its own blockGap as flex gap. Flex direction is
	// driven by the legend's block style via CSS :has() so it stays in sync
	// with whichever arrangement the user picks for the legend.
	$chart_gap_css = simple_graphs_resolve_block_gap(
		isset( $attributes['style']['spacing']['blockGap'] ) ? $attributes['style']['spacing']['blockGap'] : ''
	);
	$wrapper       = get_block_wrapper_attributes(
		array(
			'style' => 'gap:' . $chart_gap_css . ';',
		)
	);

	// Render each chart inner block in order so the Legend can appear above,
	// below, or beside the Data block depending on the user's arrangement.
	$inner_html = '';
	foreach ( $normalized_inner as $inner ) {
		if ( 'simple-graphs/data' === $inner['blockName'] ) {
			$inner_html .= simple_graphs_render_data_html(
				isset( $inner['attrs'] ) ? $inner['attrs'] : array(),
				isset( $inner['innerBlocks'] ) ? $inner['innerBlocks'] : array(),
				$sg_max,
				$value_mode,
				$prefix,
				$suffix,
				$has_legend
			);
		} elseif ( 'simple-graphs/legend' === $inner['blockName'] ) {
			$inner_html .= simple_graphs_render_legend_html( $items, isset( $inner['attrs'] ) ? $inner['attrs'] : array() );
		}
	}

	return sprintf( '<div %s>%s</div>', $wrapper, $inner_html );
}

/**
 * Render the Data block wrapper and its data-item children.
 *
 * @param array  $attrs       Data block attributes.
 * @param array  $inner_items Data block inner blocks (should be data-items).
 * @param float  $sg_max      Computed max value for scaling.
 * @param string $value_mode  Chart value mode.
 * @param string $prefix      Chart value prefix.
 * @param string $suffix      Chart value suffix.
 * @param bool   $has_legend  Whether the chart also has a legend child.
 * @return string
 */
function simple_graphs_render_data_html( $attrs, $inner_items, $sg_max, $value_mode, $prefix, $suffix, $has_legend ) {
	$block_gap   = isset( $attrs['style']['spacing']['blockGap'] ) ? $attrs['style']['spacing']['blockGap'] : '';
	$normalized  = trim( str_replace( ' ', '', (string) $block_gap ) );
	$is_zero_gap = in_array( $normalized, array( '0', '0px', '0rem', '0em' ), true );
	$gap_css     = simple_graphs_resolve_block_gap( $block_gap );

	$classes = array( 'wp-block-simple-graphs-data' );
	if ( $is_zero_gap ) {
		$classes[] = 'simple-graphs-data--no-gap';
	}
	$is_circular = false;
	if ( ! empty( $attrs['className'] ) ) {
		$custom_classes = preg_split( '/\s+/', $attrs['className'] );
		$custom_classes = array_filter( array_map( 'sanitize_html_class', $custom_classes ) );
		if ( ! empty( $custom_classes ) ) {
			$classes = array_merge( $classes, $custom_classes );
			$is_circular = (bool) preg_grep( '/^is-style-(pie|donut|bubble)$/', $custom_classes );
		}
	}

	// Background: preset or custom.
	$bg_inline = '';
	if ( ! empty( $attrs['backgroundColor'] ) ) {
		$classes[] = 'has-' . sanitize_html_class( $attrs['backgroundColor'] ) . '-background-color';
		$classes[] = 'has-background';
	} elseif ( ! empty( $attrs['style']['color']['background'] ) ) {
		$bg_inline = 'background-color:' . $attrs['style']['color']['background'] . ';';
		$classes[] = 'has-background';
	}

	$style = sprintf(
		'--sg-max:%s;--sg-gap:%s;gap:%s;%s',
		esc_attr( (string) $sg_max ),
		esc_attr( $gap_css ),
		esc_attr( $gap_css ),
		$bg_inline
	);

	if ( $is_circular ) {
		// Simple fallback rendering for circular charts on frontend.
		// TODO: port SVG rendering from JS to PHP for proper visualization.
		$items_html = '<div class="simple-graphs-data__circular-fallback">';
		foreach ( $inner_items as $inner ) {
			if ( 'simple-graphs/data-item' !== $inner['blockName'] ) {
				continue;
			}
			$child_attrs = isset( $inner['attrs'] ) ? $inner['attrs'] : array();
			$items_html .= sprintf(
				'<div class="simple-graphs-data__circular-item"><span class="simple-graphs-legend__swatch" style="background:%s"></span><span>%s</span></div>',
				esc_attr( simple_graphs_resolve_color( $child_attrs ) ),
				esc_html( isset( $child_attrs['title'] ) ? $child_attrs['title'] : '' )
			);
		}
		$items_html .= '</div>';
	} else {
		$items_html = '';
		foreach ( $inner_items as $inner ) {
			if ( 'simple-graphs/data-item' !== $inner['blockName'] ) {
				continue;
			}
			$items_html .= simple_graphs_render_data_item_html(
				isset( $inner['attrs'] ) ? $inner['attrs'] : array(),
				$value_mode,
				$prefix,
				$suffix,
				$has_legend
			);
		}
	}

	return sprintf(
		'<div class="%s" style="%s">%s</div>',
		esc_attr( implode( ' ', $classes ) ),
		esc_attr( $style ),
		$items_html
	);
}

/**
 * Resolve a block gap value to a CSS value.
 *
 * @param string $gap Raw block gap attribute.
 * @return string
 */
function simple_graphs_resolve_block_gap( $gap ) {
	if ( empty( $gap ) ) {
		return 'var(--wp--preset--spacing--30, 1rem)';
	}
	if ( strpos( $gap, 'var:preset|spacing|' ) === 0 ) {
		$slug = str_replace( 'var:preset|spacing|', '', $gap );
		return 'var(--wp--preset--spacing--' . $slug . ')';
	}
	return $gap;
}

/**
 * Render a single data-item element using the parent chart's formatting.
 *
 * @param array  $attrs      Data-item attributes.
 * @param string $value_mode Chart's value mode (percentage|custom).
 * @param string $prefix     Chart's value prefix.
 * @param string $suffix     Chart's value suffix.
 * @param bool   $has_legend Whether the parent chart has a legend child.
 * @return string
 */
function simple_graphs_render_data_item_html( $attrs, $value_mode, $prefix, $suffix, $has_legend = false ) {
	$value   = $attrs['value'] ?? '';
	$title   = $attrs['title'] ?? '';
	$numeric = (float) str_replace( array( ',', ' ' ), '', (string) $value );

	if ( 'percentage' === $value_mode ) {
		$display = $value . '%';
	} else {
		$display = $prefix . $value . $suffix;
	}

	$class = 'wp-block-simple-graphs-data-item';
	if ( ! empty( $attrs['className'] ) ) {
		$custom_classes = preg_split( '/\s+/', $attrs['className'] );
		$custom_classes = array_filter( array_map( 'sanitize_html_class', $custom_classes ) );
		if ( ! empty( $custom_classes ) ) {
			$class .= ' ' . implode( ' ', $custom_classes );
		}
	}

	$has_preset_bg = ! empty( $attrs['backgroundColor'] );
	$has_custom_bg = ! empty( $attrs['style']['color']['background'] );

	$styles = array( sprintf( '--sg-value:%s', $numeric ) );
	if ( ! $has_preset_bg && ! $has_custom_bg ) {
		// No background set — neutral default with dark text.
		$styles[] = 'background-color:#F0F0F0';
		$styles[] = 'color:#000';
	} else {
		if ( $has_custom_bg ) {
			$color = $attrs['style']['color']['background'];
			if ( 0 === strpos( $color, 'var:preset|color|' ) ) {
				$slug  = str_replace( 'var:preset|color|', '', $color );
				$color = 'var(--wp--preset--color--' . $slug . ')';
			}
			$styles[] = 'background-color:' . $color;
		}
		if ( $has_preset_bg ) {
			$class .= ' has-' . sanitize_html_class( $attrs['backgroundColor'] ) . '-background-color has-background';
		}
		// Preset / var colors are assumed dark; use white text. Custom hex
		// contrast is left to the stylesheet since we can't compute it in PHP
		// without resolving the value.
		$styles[] = 'color:#fff';
	}
	$style_attr = sprintf( ' style="%s"', esc_attr( implode( ';', $styles ) ) );
	$title_html = ( $title && ! $has_legend ) ? sprintf( '<span class="simple-graphs-data-item__title">%s</span>', wp_kses_post( $title ) ) : '';

	return sprintf(
		'<div class="%s"%s><span class="simple-graphs-data-item__value">%s</span>%s</div>',
		esc_attr( $class ),
		$style_attr,
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
	// Use WP_Block_Supports-style wrapper attributes by constructing them manually.
	// We can't use get_block_wrapper_attributes() here because we're not inside a block's render.
	// Instead, compute the wrapper class and style from the legend's attrs.

	$classes = array( 'wp-block-simple-graphs-legend' );
	if ( ! empty( $legend_attrs['className'] ) ) {
		$custom_classes = preg_split( '/\s+/', $legend_attrs['className'] );
		$custom_classes = array_filter( array_map( 'sanitize_html_class', $custom_classes ) );
		if ( ! empty( $custom_classes ) ) {
			$classes = array_merge( $classes, $custom_classes );
		}
	}

	// Typography: font size, font family, text color classes (preset).
	if ( ! empty( $legend_attrs['fontSize'] ) ) {
		$classes[] = 'has-' . sanitize_html_class( $legend_attrs['fontSize'] ) . '-font-size';
	}
	if ( ! empty( $legend_attrs['fontFamily'] ) ) {
		$classes[] = 'has-' . sanitize_html_class( $legend_attrs['fontFamily'] ) . '-font-family';
	}
	if ( ! empty( $legend_attrs['textColor'] ) ) {
		$classes[] = 'has-' . sanitize_html_class( $legend_attrs['textColor'] ) . '-color';
		$classes[] = 'has-text-color';
	}

	// Inline styles: custom typography and color.
	$styles = array();
	if ( ! empty( $legend_attrs['style']['typography']['fontSize'] ) ) {
		$styles[] = 'font-size:' . $legend_attrs['style']['typography']['fontSize'];
	}
	if ( ! empty( $legend_attrs['style']['typography']['fontWeight'] ) ) {
		$styles[] = 'font-weight:' . $legend_attrs['style']['typography']['fontWeight'];
	}
	if ( ! empty( $legend_attrs['style']['typography']['fontStyle'] ) ) {
		$styles[] = 'font-style:' . $legend_attrs['style']['typography']['fontStyle'];
	}
	if ( ! empty( $legend_attrs['style']['typography']['lineHeight'] ) ) {
		$styles[] = 'line-height:' . $legend_attrs['style']['typography']['lineHeight'];
	}
	if ( ! empty( $legend_attrs['style']['typography']['letterSpacing'] ) ) {
		$styles[] = 'letter-spacing:' . $legend_attrs['style']['typography']['letterSpacing'];
	}
	if ( ! empty( $legend_attrs['style']['typography']['textTransform'] ) ) {
		$styles[] = 'text-transform:' . $legend_attrs['style']['typography']['textTransform'];
	}
	if ( ! empty( $legend_attrs['style']['color']['text'] ) ) {
		$styles[] = 'color:' . $legend_attrs['style']['color']['text'];
	}
	if ( ! empty( $legend_attrs['style']['spacing']['blockGap'] ) ) {
		$gap = $legend_attrs['style']['spacing']['blockGap'];
		if ( strpos( $gap, 'var:preset|spacing|' ) === 0 ) {
			$slug = str_replace( 'var:preset|spacing|', '', $gap );
			$gap  = 'var(--wp--preset--spacing--' . $slug . ')';
		}
		$styles[] = 'gap:' . $gap;
	}

	$style_attr = ! empty( $styles ) ? sprintf( ' style="%s"', esc_attr( implode( ';', $styles ) ) ) : '';

	$items_html = '';
	foreach ( $items as $item ) {
		$items_html .= sprintf(
			'<div class="simple-graphs-legend__item"><span class="simple-graphs-legend__swatch" style="background:%s"></span><span class="simple-graphs-legend__label">%s</span></div>',
			esc_attr( $item['color'] ),
			esc_html( $item['title'] )
		);
	}

	return sprintf(
		'<div class="%s"%s>%s</div>',
		esc_attr( implode( ' ', $classes ) ),
		$style_attr,
		$items_html
	);
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
	return '#F0F0F0';
}
