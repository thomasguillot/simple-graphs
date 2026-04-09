import {
	NEUTRAL_GRAY,
	pieSlices,
	arcPath,
	polarToCartesian,
	isLowValue,
} from './shared';

const WIDTH = 500;
const HEIGHT = 420;
const CX = WIDTH / 2;
const CY = 200;
const R = 150;

export default function Pie( { items } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const slices = pieSlices( items );
	const total = items.reduce( ( s, i ) => s + i.value, 0 );
	const remainder = total < 100 ? 100 - total : 0;

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			{ remainder > 0 && (
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
				const mid = ( s.startAngle + s.endAngle ) / 2;
				const labelPos = polarToCartesian( CX, CY, R + 24, mid );
				const low = isLowValue( item.value );
				const isFullCircle =
					s.endAngle - s.startAngle >= Math.PI * 2 - 0.0001;
				return (
					<g key={ item.id }>
						{ isFullCircle ? (
							<circle cx={ CX } cy={ CY } r={ R } fill={ item.color } />
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
						<text
							x={ labelPos.x }
							y={ labelPos.y }
							textAnchor="middle"
							fontSize={ low ? 11 : 14 }
							fontWeight="600"
							fill="#111"
						>
							{ item.title } { item.value }%
						</text>
					</g>
				);
			} ) }
		</svg>
	);
}
