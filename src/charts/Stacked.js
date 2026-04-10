import { BORDER_RADIUS, NEUTRAL_GRAY, isLowValue, contrastColor } from './shared';

const WIDTH = 600;
const HEIGHT = 120;
const PADDING = 20;
const BAR_HEIGHT = 80;
const BAR_Y = 20;

export default function Stacked( { items } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const plotWidth = WIDTH - PADDING * 2;
	const total = items.reduce( ( s, i ) => s + i.value, 0 );
	const remainder = total < 100 ? 100 - total : 0;

	let cursor = PADDING;

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { width: '100%', height: 'auto' } }
		>
			<clipPath id="stacked-clip">
				<rect
					x={ PADDING }
					y={ BAR_Y }
					width={ plotWidth }
					height={ BAR_HEIGHT }
					rx={ BORDER_RADIUS }
				/>
			</clipPath>
			<g clipPath="url(#stacked-clip)">
				{ items.map( ( item ) => {
					const w = ( item.value / 100 ) * plotWidth;
					const x = cursor;
					cursor += w;
					const low = isLowValue( item.value );
					const centerX = x + w / 2;
					return (
						<g key={ item.id }>
							<rect
								x={ x }
								y={ BAR_Y }
								width={ w }
								height={ BAR_HEIGHT }
								fill={ item.color }
							/>
							{ ! low && (
								<text
									x={ centerX }
									y={ BAR_Y + BAR_HEIGHT / 2 + 8 }
									textAnchor="middle"
									fontSize={ 20 }
									fill={ contrastColor( item.color ) }
								>
									{ item.value }%
								</text>
							) }
						</g>
					);
				} ) }
				{ remainder > 0 && (
					<rect
						x={ cursor }
						y={ BAR_Y }
						width={ ( remainder / 100 ) * plotWidth }
						height={ BAR_HEIGHT }
						fill={ NEUTRAL_GRAY }
					/>
				) }
			</g>
		</svg>
	);
}
