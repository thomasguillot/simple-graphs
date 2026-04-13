import { LOW_VALUE_THRESHOLD } from './constants';

export function parseNumeric( value ) {
	if ( typeof value === 'number' ) {
		return Number.isFinite( value ) ? value : 0;
	}
	const parsed = parseFloat( String( value ).replace( /[, ]/g, '' ) );
	return Number.isFinite( parsed ) ? parsed : 0;
}

export function formatValue( value, { valueMode = 'percentage', valuePrefix = '', valueSuffix = '' } = {} ) {
	if ( valueMode === 'percentage' ) {
		return `${ value }%`;
	}
	return `${ valuePrefix }${ value }${ valueSuffix }`;
}

export function resolveMaxValue( items, valueMode = 'percentage' ) {
	const values = items.map( ( i ) => parseNumeric( i.value ) );
	const dataMax = Math.max( 1, ...values );
	if ( valueMode === 'percentage' ) {
		return Math.max( 100, dataMax );
	}
	return dataMax;
}

/**
 * Resolve a WP block gap value (preset slug, token, or raw CSS) to a usable CSS value.
 *
 * @param {string|undefined} gap Block gap attribute value.
 * @return {string} CSS value safe to use in gap/calc.
 */
export function resolveBlockGap( gap ) {
	if ( ! gap ) {
		return 'var(--wp--preset--spacing--30)';
	}
	const s = String( gap ).trim();
	if ( s.startsWith( 'var:preset|spacing|' ) ) {
		const slug = s.replace( 'var:preset|spacing|', '' );
		return `var(--wp--preset--spacing--${ slug })`;
	}
	return s;
}

export function resolveRadius( raw ) {
	if ( raw == null ) {
		return '6px';
	}
	if ( typeof raw === 'object' ) {
		const v = raw.topLeft ?? raw.topRight ?? raw.bottomRight ?? raw.bottomLeft;
		return v != null ? String( v ) : '6px';
	}
	return typeof raw === 'number' ? `${ raw }px` : String( raw );
}

/**
 * Linearise an sRGB channel value (0-255) using the sRGB transfer curve.
 * Returns a linear-light component, not luminance (Y is computed separately).
 */
function sRGBtoLin( val ) {
	const s = val / 255;
	return s <= 0.04045 ? s / 12.92 : Math.pow( ( s + 0.055 ) / 1.055, 2.4 );
}

/**
 * Compute APCA lightness contrast (Lc) for a text/background pair.
 * Positive Lc = dark text on light bg, negative = light text on dark bg.
 *
 * @param {number} txtY Text luminance (0-1).
 * @param {number} bgY  Background luminance (0-1).
 * @return {number} Lc value (typically -108 to 106).
 */
function apcaContrast( txtY, bgY ) {
	// Soft clamp near black.
	const tY = txtY > 0.022 ? txtY : txtY + Math.pow( 0.022 - txtY, 1.414 );
	const bY = bgY > 0.022 ? bgY : bgY + Math.pow( 0.022 - bgY, 1.414 );

	let Lc;
	if ( bY > tY ) {
		// Normal polarity: dark text on light background.
		Lc = ( Math.pow( bY, 0.56 ) - Math.pow( tY, 0.57 ) ) * 1.14;
	} else {
		// Reverse polarity: light text on dark background.
		Lc = ( Math.pow( bY, 0.65 ) - Math.pow( tY, 0.62 ) ) * 1.14;
	}

	if ( Math.abs( Lc ) < 0.1 ) {
		return 0;
	}
	return Lc > 0 ? ( Lc - 0.027 ) * 100 : ( Lc + 0.027 ) * 100;
}

/**
 * Pick black or white text for best contrast against a hex background using
 * APCA (Accessible Perceptual Contrast Algorithm).
 *
 * @param {string} hex Background hex colour.
 * @return {string} '#000' or '#fff'.
 */
export function contrastColor( hex ) {
	if ( ! hex || typeof hex !== 'string' ) {
		return '#000';
	}
	let c = hex.replace( '#', '' );
	if ( c.length === 3 ) {
		c = c[ 0 ] + c[ 0 ] + c[ 1 ] + c[ 1 ] + c[ 2 ] + c[ 2 ];
	}
	if ( c.length !== 6 ) {
		return '#000';
	}
	const bgY =
		0.2126729 * sRGBtoLin( parseInt( c.substring( 0, 2 ), 16 ) ) +
		0.7151522 * sRGBtoLin( parseInt( c.substring( 2, 4 ), 16 ) ) +
		0.0721750 * sRGBtoLin( parseInt( c.substring( 4, 6 ), 16 ) );

	const lcBlack = apcaContrast( 0, bgY );
	const lcWhite = apcaContrast( 1, bgY );

	return Math.abs( lcBlack ) > Math.abs( lcWhite ) ? '#000' : '#fff';
}

export function isZeroGap( gap ) {
	if ( ! gap ) {
		return false;
	}
	const s = String( gap ).trim();
	return s === '0' || s === '0px' || s === '0rem' || s === '0em';
}

export function computeTotal( items ) {
	return items.reduce( ( sum, item ) => sum + parseNumeric( item.value ), 0 );
}

export function isLowValue( value ) {
	return parseNumeric( value ) < LOW_VALUE_THRESHOLD;
}

export function pieSlices( items ) {
	const slices = [];
	let cursor = 0;
	for ( const item of items ) {
		const fraction = parseNumeric( item.value ) / 100;
		const start = cursor;
		const end = cursor + fraction * Math.PI * 2;
		slices.push( { id: item.id, value: item.value, startAngle: start, endAngle: end } );
		cursor = end;
	}
	return slices;
}

export function packBubbles( items, { width, height, padding = 8 } ) {
	if ( items.length === 0 ) {
		return [];
	}
	const values = items.map( ( i ) => Math.max( parseNumeric( i.value ), 0.1 ) );
	const rawRadii = values.map( ( v ) => Math.sqrt( v ) );
	const totalDiameter = rawRadii.reduce( ( s, r ) => s + r * 2, 0 ) + padding * ( items.length - 1 );
	const maxRadius = Math.max( ...rawRadii );
	const scaleX = width / totalDiameter;
	const scaleY = height / 2 / maxRadius;
	const scale = Math.min( scaleX, scaleY );
	const radii = rawRadii.map( ( r ) => r * scale );
	const bubbles = [];
	let cx = 0;
	for ( let i = 0; i < items.length; i++ ) {
		cx += radii[ i ];
		bubbles.push( { id: items[ i ].id, value: items[ i ].value, cx, cy: height / 2, r: radii[ i ] } );
		cx += radii[ i ] + padding;
	}
	const used = cx - padding;
	const offset = ( width - used ) / 2;
	return bubbles.map( ( b ) => ( { ...b, cx: b.cx + offset } ) );
}

export function polarToCartesian( cx, cy, r, angleRad ) {
	const a = angleRad - Math.PI / 2;
	return { x: cx + r * Math.cos( a ), y: cy + r * Math.sin( a ) };
}

export function arcPath( cx, cy, r, startAngle, endAngle ) {
	const start = polarToCartesian( cx, cy, r, startAngle );
	const end = polarToCartesian( cx, cy, r, endAngle );
	const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
	return [
		`M ${ cx } ${ cy }`,
		`L ${ start.x } ${ start.y }`,
		`A ${ r } ${ r } 0 ${ largeArc } 1 ${ end.x } ${ end.y }`,
		'Z',
	].join( ' ' );
}
