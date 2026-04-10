import { BORDER_RADIUS, isLowValue, contrastColor } from './shared';

const WIDTH = 500;
const GAP = 16;
const BAR_HEIGHT = 40;

export default function Bar( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const totalGap = GAP * ( items.length - 1 );
	const height = BAR_HEIGHT * items.length + totalGap;
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ height }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			{ items.map( ( item, i ) => {
				const w = ( item.value / maxValue ) * WIDTH;
				const y = i * ( BAR_HEIGHT + GAP );
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
						{ trackColor && (
							<rect
								x={ 0 }
								y={ y }
								width={ WIDTH }
								height={ BAR_HEIGHT }
								rx={ BORDER_RADIUS }
								fill={ trackColor }
							/>
						) }
						<rect
							x={ 0 }
							y={ y }
							width={ w }
							height={ BAR_HEIGHT }
							rx={ BORDER_RADIUS }
							fill={ item.color }
						/>
						<text
							x={ 12 }
							y={ y + BAR_HEIGHT / 2 + 6 }
							fontSize={ low ? 12 : 18 }
							fill={ contrastColor( item.color ) }
						>
							{ item.value }%
						</text>
					</g>
				);
			} ) }
		</svg>
	);
}
