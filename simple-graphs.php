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

	// Resolve the border radius from the Data block so the chart wrapper
	// can expose --sg-radius for both Data items and Legend swatches.
	$chart_radius = simple_graphs_resolve_radius(
		isset( $data_attrs['style']['border']['radius'] ) ? $data_attrs['style']['border']['radius'] : '6px'
	);

	$chart_gap_css = simple_graphs_resolve_block_gap(
		isset( $attributes['style']['spacing']['blockGap'] ) ? $attributes['style']['spacing']['blockGap'] : 'var:preset|spacing|50'
	);
	$wrapper       = get_block_wrapper_attributes(
		array(
			'style' => '--sg-radius:' . esc_attr( $chart_radius ) . ';gap:' . esc_attr( $chart_gap_css ) . ';',
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
	$radius = simple_graphs_resolve_radius(
		isset( $attrs['style']['border']['radius'] ) ? $attrs['style']['border']['radius'] : '6px'
	);

	$classes = array( 'wp-block-simple-graphs-data' );
	if ( $is_zero_gap ) {
		$classes[] = 'simple-graphs-data--no-gap';
	}
	if ( ! empty( $attrs['compensateGap'] ) ) {
		$classes[] = 'simple-graphs-data--compensate-gap';
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

	// Background color becomes the track color behind each bar rather than
	// filling the entire Data wrapper.
	$track_css = '';
	if ( ! empty( $attrs['backgroundColor'] ) ) {
		$track_color = 'var(--wp--preset--color--' . $attrs['backgroundColor'] . ')';
		$track_css   = '--sg-track:' . esc_attr( $track_color ) . ';';
		$classes[]   = 'simple-graphs-data--has-track';
	} elseif ( ! empty( $attrs['style']['color']['background'] ) ) {
		$track_color = simple_graphs_resolve_color_value( $attrs['style']['color']['background'] );
		$track_css   = '--sg-track:' . esc_attr( $track_color ) . ';';
		$classes[]   = 'simple-graphs-data--has-track';
	}

	$style = sprintf(
		'--sg-max:%s;--sg-gap:%s;--sg-radius:%s;gap:%s;%s',
		esc_attr( (string) $sg_max ),
		esc_attr( $gap_css ),
		esc_attr( $radius ),
		esc_attr( $gap_css ),
		$track_css
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
	$gap = trim( (string) $gap );
	if ( '' === $gap ) {
		return 'var(--wp--preset--spacing--30)';
	}
	if ( strpos( $gap, 'var:preset|spacing|' ) === 0 ) {
		$slug = str_replace( 'var:preset|spacing|', '', $gap );
		return 'var(--wp--preset--spacing--' . $slug . ')';
	}
	return $gap;
}

/**
 * Resolve a border radius value to a CSS string.
 *
 * WordPress may store this as a string ("6px"), a number, or an object with
 * per-corner values ({ topLeft, topRight, bottomRight, bottomLeft }).
 *
 * @param mixed $radius Raw border radius attribute value.
 * @return string
 */
function simple_graphs_resolve_radius( $radius ) {
	if ( is_array( $radius ) ) {
		$resolved = null;
		foreach ( array( 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ) as $key ) {
			if ( isset( $radius[ $key ] ) && '' !== $radius[ $key ] ) {
				$resolved = $radius[ $key ];
				break;
			}
		}
		$radius = null !== $resolved ? $resolved : '6px';
	}
	if ( is_numeric( $radius ) ) {
		return $radius . 'px';
	}
	$radius = (string) $radius;
	// Only allow safe CSS values: lengths, percentages, var() references.
	if ( preg_match( '/^[\d.]+(px|em|rem|%|vw|vh)$/', $radius ) || preg_match( '/^var\(--[\w-]+/', $radius ) ) {
		return $radius;
	}
	return '6px';
}

/**
 * Pick black or white text for readable contrast against a hex background.
 * Returns null when the value can't be resolved to RGB (e.g. tokens, vars, rgb()).
 *
 * @param string $value Color value.
 * @return string|null
 */
function simple_graphs_contrast_color( $value ) {
	$value = trim( (string) $value );
	if ( ! preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $value ) ) {
		return null;
	}
	$hex = ltrim( $value, '#' );
	if ( 3 === strlen( $hex ) ) {
		$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}
	$r = hexdec( substr( $hex, 0, 2 ) ) / 255;
	$g = hexdec( substr( $hex, 2, 2 ) ) / 255;
	$b = hexdec( substr( $hex, 4, 2 ) ) / 255;
	$luminance = ( 0.2126 * $r ) + ( 0.7152 * $g ) + ( 0.0722 * $b );
	return $luminance > 0.5 ? '#000' : '#fff';
}

/**
 * Normalize a stored color string to a CSS value. Handles the editor's
 * var:preset|color|slug token shape, passing raw hex/rgb/vars through as-is.
 *
 * @param string $value Raw color attribute value.
 * @return string
 */
function simple_graphs_resolve_color_value( $value ) {
	$value = trim( (string) $value );
	if ( '' === $value ) {
		return '';
	}
	if ( 0 === strpos( $value, 'var:preset|color|' ) ) {
		$slug = str_replace( 'var:preset|color|', '', $value );
		return 'var(--wp--preset--color--' . $slug . ')';
	}
	return $value;
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

	// Outer wrapper (track) only gets --sg-value for CSS height calc.
	$track_style = sprintf( '--sg-value:%s', $numeric );

	// Inner bar gets the background color and text color.
	$bar_class  = 'simple-graphs-data-item__bar';
	$bar_styles = array();
	if ( ! $has_preset_bg && ! $has_custom_bg ) {
		$bar_styles[] = 'background-color:#F0F0F0';
		$bar_styles[] = 'color:#000';
	} else {
		$text_color = '#fff';
		if ( $has_custom_bg ) {
			$raw_bg       = $attrs['style']['color']['background'];
			$bar_styles[] = 'background-color:' . simple_graphs_resolve_color_value( $raw_bg );
			$computed     = simple_graphs_contrast_color( $raw_bg );
			if ( null !== $computed ) {
				$text_color = $computed;
			}
		}
		if ( $has_preset_bg ) {
			$bar_class .= ' has-' . sanitize_html_class( $attrs['backgroundColor'] ) . '-background-color has-background';
		}
		$bar_styles[] = 'color:' . $text_color;
	}
	$bar_style_attr = ! empty( $bar_styles ) ? sprintf( ' style="%s"', esc_attr( implode( ';', $bar_styles ) ) ) : '';
	$title_html     = ( $title && ! $has_legend ) ? sprintf( '<span class="simple-graphs-data-item__title">%s</span>', wp_kses_post( $title ) ) : '';

	return sprintf(
		'<div class="%s" style="%s"><div class="%s"%s><span class="simple-graphs-data-item__value">%s</span>%s</div></div>',
		esc_attr( $class ),
		esc_attr( $track_style ),
		esc_attr( $bar_class ),
		$bar_style_attr,
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
		$styles[] = 'gap:' . simple_graphs_resolve_block_gap( $legend_attrs['style']['spacing']['blockGap'] );
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
		return simple_graphs_resolve_color_value( $attrs['style']['color']['background'] );
	}
	if ( ! empty( $attrs['backgroundColor'] ) ) {
		return 'var(--wp--preset--color--' . $attrs['backgroundColor'] . ')';
	}
	return '#F0F0F0';
}
