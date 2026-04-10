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

export function resolveMaxValue( items, valueMode = 'percentage', valueMax = 0 ) {
	const values = items.map( ( i ) => parseNumeric( i.value ) );
	if ( valueMode === 'percentage' ) {
		return Math.max( 100, ...values );
	}
	const dataMax = Math.max( ...values, 1 );
	return valueMax > 0 ? Math.max( valueMax, dataMax ) : dataMax;
}

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
