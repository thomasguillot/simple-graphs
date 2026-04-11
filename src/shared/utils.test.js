import {
	computeTotal,
	isLowValue,
	pieSlices,
	packBubbles,
	formatValue,
	resolveMaxValue,
	parseNumeric,
} from './utils';
import { BORDER_RADIUS, LOW_VALUE_THRESHOLD } from './constants';

describe( 'shared chart helpers', () => {
	test( 'constants', () => {
		expect( BORDER_RADIUS ).toBe( 6 );
		expect( LOW_VALUE_THRESHOLD ).toBe( 4 );
	} );

	test( 'computeTotal sums values', () => {
		expect(
			computeTotal( [ { value: 10 }, { value: 20 }, { value: 5 } ] )
		).toBe( 35 );
		expect( computeTotal( [] ) ).toBe( 0 );
	} );

	test( 'isLowValue detects values below threshold', () => {
		expect( isLowValue( 3 ) ).toBe( true );
		expect( isLowValue( 4 ) ).toBe( false );
		expect( isLowValue( 50 ) ).toBe( false );
	} );

	test( 'pieSlices produces cumulative angles based on 100 whole', () => {
		const slices = pieSlices( [
			{ id: 'a', value: 25 },
			{ id: 'b', value: 25 },
		] );
		expect( slices ).toHaveLength( 2 );
		expect( slices[ 0 ].startAngle ).toBeCloseTo( 0 );
		expect( slices[ 0 ].endAngle ).toBeCloseTo( Math.PI / 2 );
		expect( slices[ 1 ].endAngle ).toBeCloseTo( Math.PI );
	} );

	test( 'pieSlices treats 100 as full circle', () => {
		const slices = pieSlices( [
			{ id: 'a', value: 50 },
			{ id: 'b', value: 50 },
		] );
		expect( slices[ 1 ].endAngle ).toBeCloseTo( Math.PI * 2 );
	} );

	test( 'packBubbles handles string values with commas', () => {
		const bubbles = packBubbles(
			[
				{ id: 'a', value: '1,000' },
				{ id: 'b', value: '250' },
			],
			{ width: 400, height: 200 }
		);
		expect( bubbles ).toHaveLength( 2 );
		const ratio = ( bubbles[ 0 ].r * bubbles[ 0 ].r ) / ( bubbles[ 1 ].r * bubbles[ 1 ].r );
		expect( ratio ).toBeCloseTo( 4, 1 );
	} );

	test( 'packBubbles returns non-overlapping circles with areas proportional to value', () => {
		const bubbles = packBubbles(
			[
				{ id: 'a', value: 40 },
				{ id: 'b', value: 10 },
			],
			{ width: 400, height: 200 }
		);
		expect( bubbles ).toHaveLength( 2 );
		const ratio =
			( bubbles[ 0 ].r * bubbles[ 0 ].r ) /
			( bubbles[ 1 ].r * bubbles[ 1 ].r );
		expect( ratio ).toBeCloseTo( 4, 1 );
		const dx = bubbles[ 0 ].cx - bubbles[ 1 ].cx;
		const dy = bubbles[ 0 ].cy - bubbles[ 1 ].cy;
		const dist = Math.sqrt( dx * dx + dy * dy );
		expect( dist ).toBeGreaterThanOrEqual(
			bubbles[ 0 ].r + bubbles[ 1 ].r - 0.01
		);
	} );
} );

describe( 'formatValue', () => {
	test( 'percentage mode appends %', () => {
		expect( formatValue( 42 ) ).toBe( '42%' );
		expect( formatValue( 42, { valueMode: 'percentage' } ) ).toBe( '42%' );
	} );
	test( 'custom mode with prefix and suffix', () => {
		expect( formatValue( 42, { valueMode: 'custom', valuePrefix: '$', valueSuffix: 'k' } ) ).toBe( '$42k' );
	} );
	test( 'custom mode with no prefix/suffix', () => {
		expect( formatValue( 42, { valueMode: 'custom' } ) ).toBe( '42' );
	} );
} );

describe( 'resolveMaxValue', () => {
	test( 'percentage mode uses 100 as floor', () => {
		expect( resolveMaxValue( [ { value: 30 }, { value: 50 } ] ) ).toBe( 100 );
		expect( resolveMaxValue( [ { value: 120 } ] ) ).toBe( 120 );
	} );
	test( 'custom mode derives from data', () => {
		expect( resolveMaxValue( [ { value: 300 }, { value: 500 } ], 'custom' ) ).toBe( 500 );
	} );
	test( 'empty items returns 1 in custom mode', () => {
		expect( resolveMaxValue( [], 'custom' ) ).toBe( 1 );
	} );
	test( 'handles string values with commas', () => {
		expect( resolveMaxValue( [ { value: '2,180' }, { value: '1,500' } ], 'custom' ) ).toBe( 2180 );
	} );
} );

describe( 'parseNumeric', () => {
	test( 'parses plain numbers', () => {
		expect( parseNumeric( 42 ) ).toBe( 42 );
		expect( parseNumeric( '42' ) ).toBe( 42 );
	} );
	test( 'strips commas', () => {
		expect( parseNumeric( '2,180.20' ) ).toBeCloseTo( 2180.2 );
		expect( parseNumeric( '1,000,000' ) ).toBe( 1000000 );
	} );
	test( 'preserves decimals', () => {
		expect( parseNumeric( '20.00' ) ).toBe( 20 );
		expect( parseNumeric( '54.78' ) ).toBeCloseTo( 54.78 );
	} );
	test( 'handles empty/invalid', () => {
		expect( parseNumeric( '' ) ).toBe( 0 );
		expect( parseNumeric( 'abc' ) ).toBe( 0 );
	} );
} );
