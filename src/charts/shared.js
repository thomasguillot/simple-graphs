export const BORDER_RADIUS = 6;
export const LOW_VALUE_THRESHOLD = 4;
export const FONT_STACK =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif';
export const NEUTRAL_GRAY = '#E5E7EB';

export function formatValue( value, { valueMode = 'percentage', valuePrefix = '', valueSuffix = '' } = {} ) {
	if ( valueMode === 'percentage' ) {
		return `${ value }%`;
	}
	return `${ valuePrefix }${ value }${ valueSuffix }`;
}

export function resolveMaxValue( items, valueMode = 'percentage' ) {
	const values = items.map( ( i ) => Number( i.value ) || 0 );
	if ( valueMode === 'percentage' ) {
		return Math.max( 100, ...values );
	}
	return Math.max( ...values, 1 );
}

/**
 * Returns '#fff' or '#000' depending on which has better contrast against bg.
 * Uses relative luminance formula from WCAG.
 */
export function contrastColor( hex ) {
	if ( ! hex || typeof hex !== 'string' ) {
		return '#000';
	}
	const c = hex.replace( '#', '' );
	if ( c.length < 6 ) {
		return '#000';
	}
	const r = parseInt( c.substring( 0, 2 ), 16 ) / 255;
	const g = parseInt( c.substring( 2, 4 ), 16 ) / 255;
	const b = parseInt( c.substring( 4, 6 ), 16 ) / 255;
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance > 0.5 ? '#000' : '#fff';
}

export function isZeroGap( gap ) {
	if ( ! gap ) {
		return false;
	}
	const s = String( gap ).trim();
	return s === '0' || s === '0px' || s === '0rem' || s === '0em';
}

export function computeTotal( items ) {
	return items.reduce(
		( sum, item ) => sum + ( Number( item.value ) || 0 ),
		0
	);
}

export function isLowValue( value ) {
	return Number( value ) < LOW_VALUE_THRESHOLD;
}

/**
 * Compute pie/donut slice angles. Treats 100 as a full circle.
 * Returns array of { id, value, startAngle, endAngle } in radians.
 * @param {Array} items Data items.
 */
export function pieSlices( items ) {
	const slices = [];
	let cursor = 0;
	for ( const item of items ) {
		const fraction = ( Number( item.value ) || 0 ) / 100;
		const start = cursor;
		const end = cursor + fraction * Math.PI * 2;
		slices.push( {
			id: item.id,
			value: item.value,
			startAngle: start,
			endAngle: end,
		} );
		cursor = end;
	}
	return slices;
}

/**
 * Pack circles horizontally, area proportional to value, non-overlapping.
 * @param {Array}  items         Data items.
 * @param {Object} root0         Layout options.
 * @param {number} root0.width   Plot width.
 * @param {number} root0.height  Plot height.
 * @param {number} root0.padding Spacing between bubbles.
 */
export function packBubbles( items, { width, height, padding = 8 } ) {
	if ( items.length === 0 ) {
		return [];
	}
	const values = items.map( ( i ) =>
		Math.max( Number( i.value ) || 0, 0.1 )
	);
	const rawRadii = values.map( ( v ) => Math.sqrt( v ) );
	const totalDiameter =
		rawRadii.reduce( ( s, r ) => s + r * 2, 0 ) +
		padding * ( items.length - 1 );
	const maxRadius = Math.max( ...rawRadii );
	const scaleX = width / totalDiameter;
	const scaleY = height / 2 / maxRadius;
	const scale = Math.min( scaleX, scaleY );

	const radii = rawRadii.map( ( r ) => r * scale );
	const bubbles = [];
	let cx = 0;
	for ( let i = 0; i < items.length; i++ ) {
		cx += radii[ i ];
		bubbles.push( {
			id: items[ i ].id,
			value: items[ i ].value,
			cx,
			cy: height / 2,
			r: radii[ i ],
		} );
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
	// A full circle can't be drawn with a single arc; caller should handle that case.
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
