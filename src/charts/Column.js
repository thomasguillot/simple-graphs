import { BORDER_RADIUS, isLowValue } from './shared';

const WIDTH = 600;
const HEIGHT = 320;
const GAP = 16;

export default function Column( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const totalGap = GAP * ( items.length - 1 );
	const barWidth = ( WIDTH - totalGap ) / items.length;
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			{ items.map( ( item, i ) => {
				const h = ( item.value / maxValue ) * HEIGHT;
				const x = i * ( barWidth + GAP );
				const y = HEIGHT - h;
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
						{ trackColor && (
							<rect
								x={ x }
								y={ 0 }
								width={ barWidth }
								height={ HEIGHT }
								rx={ BORDER_RADIUS }
								fill={ trackColor }
							/>
						) }
						<rect
							x={ x }
							y={ y }
							width={ barWidth }
							height={ h }
							rx={ BORDER_RADIUS }
							fill={ item.color }
						/>
						<text
							x={ x + barWidth / 2 }
							y={ HEIGHT - 16 }
							textAnchor="middle"
							fontSize={ low ? 12 : 16 }
							fontWeight="700"
							fill="#111"
						>
							{ item.value }%
						</text>
					</g>
				);
			} ) }
		</svg>
	);
}
