import { Icon as IconComponent } from '@wordpress/components';
import { BORDER_RADIUS, TRACK_PADDING, TRACK_RADIUS, isLowValue } from './shared';
import { getIcon } from '../icons';

const WIDTH = 600;
const PADDING = 20;
const ROW_HEIGHT = 44;
const BAR_HEIGHT = 28;
const LABEL_WIDTH = 140;

export default function Bar( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const height = PADDING * 2 + ROW_HEIGHT * items.length;
	const plotWidth = WIDTH - PADDING * 2 - LABEL_WIDTH - 60;
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
				const x = PADDING + LABEL_WIDTH;
				const icon = getIcon( item.icon );
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
						<text
							x={ PADDING + LABEL_WIDTH - 8 }
							y={ y + BAR_HEIGHT / 2 + 5 }
							textAnchor="end"
							fontSize={ 13 }
							fill="#374151"
						>
							{ item.title }
						</text>
						{ trackColor && (
							<rect
								x={ x - TRACK_PADDING }
								y={ y - TRACK_PADDING }
								width={ plotWidth + TRACK_PADDING * 2 }
								height={ BAR_HEIGHT + TRACK_PADDING * 2 }
								rx={ TRACK_RADIUS }
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
						{ icon && w > 34 && (
							<foreignObject
								x={ x + 6 }
								y={ y + 4 }
								width={ 20 }
								height={ 20 }
							>
								<div style={ { color: '#fff' } }>
									<IconComponent icon={ icon } size={ 20 } />
								</div>
							</foreignObject>
						) }
						<text
							x={ x + w + 8 }
							y={ y + BAR_HEIGHT / 2 + 5 }
							fontSize={ low ? 13 : 16 }
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
