import {
	NEUTRAL_GRAY,
	contrastColor,
	pieSlices,
	arcPath,
	polarToCartesian,
	isLowValue,
} from './shared';

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 150;

export default function Pie( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const slices = pieSlices( items );
	const total = items.reduce( ( s, i ) => s + i.value, 0 );

	return (
		<svg
			viewBox={ `0 0 ${ SIZE } ${ SIZE }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			{ trackColor && (
				<circle cx={ CX } cy={ CY } r={ R + 24 } fill={ trackColor } />
			) }
			{ total < 100 && (
				<circle
					cx={ CX }
					cy={ CY }
					r={ R }
					fill="none"
					stroke={ NEUTRAL_GRAY }
					strokeWidth={ 2 }
					strokeDasharray="4 4"
				/>
			) }
			{ slices.map( ( s, i ) => {
				const item = items[ i ];
				const isFullCircle =
					s.endAngle - s.startAngle >= Math.PI * 2 - 0.0001;
				const mid = ( s.startAngle + s.endAngle ) / 2;
				const labelR = R * 0.6;
				const labelPos = polarToCartesian( CX, CY, labelR, mid );
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
						{ isFullCircle ? (
							<circle
								cx={ CX }
								cy={ CY }
								r={ R }
								fill={ item.color }
							/>
						) : (
							<path
								d={ arcPath(
									CX,
									CY,
									R,
									s.startAngle,
									s.endAngle
								) }
								fill={ item.color }
							/>
						) }
						{ ! low && (
							<text
								x={ labelPos.x }
								y={ labelPos.y + 5 }
								textAnchor="middle"
								fontSize={ 18 }
								fill={ contrastColor( item.color ) }
							>
								{ item.value }%
							</text>
						) }
					</g>
				);
			} ) }
		</svg>
	);
}
