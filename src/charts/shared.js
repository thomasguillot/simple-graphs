export const BORDER_RADIUS = 6;
export const LOW_VALUE_THRESHOLD = 4;
export const FONT_STACK =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif';
export const NEUTRAL_GRAY = '#E5E7EB';

export function computeTotal( items ) {
	return items.reduce( ( sum, item ) => sum + ( Number( item.value ) || 0 ), 0 );
}

export function isLowValue( value ) {
	return Number( value ) < LOW_VALUE_THRESHOLD;
}

/**
 * Compute pie/donut slice angles. Treats 100 as a full circle.
 * Returns array of { id, value, startAngle, endAngle } in radians.
 */
export function pieSlices( items ) {
	const slices = [];
	let cursor = 0;
	for ( const item of items ) {
		const fraction = ( Number( item.value ) || 0 ) / 100;
		const start = cursor;
		const end = cursor + fraction * Math.PI * 2;
		slices.push( { id: item.id, value: item.value, startAngle: start, endAngle: end } );
		cursor = end;
	}
	return slices;
}

/**
 * Pack circles horizontally, area proportional to value, non-overlapping.
 */
export function packBubbles( items, { width, height, padding = 8 } ) {
	if ( items.length === 0 ) {
		return [];
	}
	const values = items.map( ( i ) => Math.max( Number( i.value ) || 0, 0.1 ) );
	const rawRadii = values.map( ( v ) => Math.sqrt( v ) );
	const totalDiameter = rawRadii.reduce( ( s, r ) => s + r * 2, 0 ) + padding * ( items.length - 1 );
	const maxRadius = Math.max( ...rawRadii );
	const scaleX = width / totalDiameter;
	const scaleY = ( height / 2 ) / maxRadius;
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
	const start = polarToCartesian( cx, cy, r, endAngle );
	const end = polarToCartesian( cx, cy, r, startAngle );
	const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
	return [
		`M ${ cx } ${ cy }`,
		`L ${ end.x } ${ end.y }`,
		`A ${ r } ${ r } 0 ${ largeArc } 0 ${ start.x } ${ start.y }`,
		'Z',
	].join( ' ' );
}
