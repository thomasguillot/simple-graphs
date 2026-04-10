import { BORDER_RADIUS, isLowValue } from './shared';

const WIDTH = 500;
const PADDING = 20;
const ROW_HEIGHT = 48;
const BAR_HEIGHT = 32;

export default function Bar( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const height = PADDING * 2 + ROW_HEIGHT * items.length;
	const plotWidth = WIDTH - PADDING * 2;
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ height }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			{ items.map( ( item, i ) => {
				const w = ( item.value / maxValue ) * plotWidth;
				const y =
					PADDING + i * ROW_HEIGHT + ( ROW_HEIGHT - BAR_HEIGHT ) / 2;
				const x = PADDING;
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
						{ trackColor && (
							<rect
								x={ x }
								y={ y }
								width={ plotWidth }
								height={ BAR_HEIGHT }
								rx={ BORDER_RADIUS }
								fill={ trackColor }
							/>
						) }
						<rect
							x={ x }
							y={ y }
							width={ w }
							height={ BAR_HEIGHT }
							rx={ BORDER_RADIUS }
							fill={ item.color }
						/>
						<text
							x={ x + 12 }
							y={ y + BAR_HEIGHT / 2 + 5 }
							fontSize={ low ? 12 : 18 }
							fontWeight="700"
							fill="#fff"
						>
							{ item.value }%
						</text>
					</g>
				);
			} ) }
		</svg>
	);
}
