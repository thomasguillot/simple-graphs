import {
	BORDER_RADIUS,
	LOW_VALUE_THRESHOLD,
	computeTotal,
	isLowValue,
	pieSlices,
	packBubbles,
} from './shared';

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
