import { NEUTRAL_GRAY, computeTotal, pieSlices, polarToCartesian, isLowValue } from './shared';

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 120;
const STROKE = 40;

export default function Donut( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const circumference = 2 * Math.PI * R;
	let dashOffset = 0;
	const total = computeTotal( items );
	const largest = items.reduce(
		( a, b ) => ( Number( a.value ) > Number( b.value ) ? a : b ),
		items[ 0 ]
	);
	const slices = pieSlices( items );

	return (
		<svg
			viewBox={ `0 0 ${ SIZE } ${ SIZE }` }
			preserveAspectRatio="xMidYMid meet"
		>
			{ trackColor && (
				<circle cx={ CX } cy={ CY } r={ R + STROKE / 2 + 24 } fill={ trackColor } />
			) }
			{ total < 100 && (
				<circle
					cx={ CX }
					cy={ CY }
					r={ R }
					fill="none"
					stroke={ NEUTRAL_GRAY }
					strokeWidth={ STROKE }
				/>
			) }
			<g transform={ `rotate(-90 ${ CX } ${ CY })` }>
				{ items.map( ( item ) => {
					const len = ( item.value / 100 ) * circumference;
					const seg = (
						<circle
							key={ item.id }
							cx={ CX }
							cy={ CY }
							r={ R }
							fill="none"
							stroke={ item.color }
							strokeWidth={ STROKE }
							strokeDasharray={ `${ len } ${
								circumference - len
							}` }
							strokeDashoffset={ -dashOffset }
						/>
					);
					dashOffset += len;
					return seg;
				} ) }
			</g>
			<text
				x={ CX }
				y={ CY + 10 }
				textAnchor="middle"
				fontSize={ 28 }
				fill="#000"
			>
				{ largest.value }%
			</text>
			{ /* Value labels outside the ring */ }
			{ slices.map( ( s, i ) => {
				const item = items[ i ];
				const mid = ( s.startAngle + s.endAngle ) / 2;
				const labelR = R + STROKE / 2 + 20;
				const pos = polarToCartesian( CX, CY, labelR, mid );
				const low = isLowValue( item.value );
				if ( low ) {
					return null;
				}
				return (
					<text
						key={ `label-${ item.id }` }
						x={ pos.x }
						y={ pos.y + 5 }
						textAnchor="middle"
						fontSize={ 14 }
						fontWeight="600"
						fill="#000"
					>
						{ item.value }%
					</text>
				);
			} ) }
		</svg>
	);
}
