import { Icon as IconComponent } from '@wordpress/components';
import { BORDER_RADIUS, FONT_STACK, isLowValue } from './shared';
import { getIcon } from '../icons';

const WIDTH = 600;
const HEIGHT = 360;
const PADDING_X = 20;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 60;

export default function Column( { items } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
	const slotWidth = ( WIDTH - PADDING_X * 2 ) / items.length;
	const barWidth = Math.min( slotWidth * 0.7, 80 );
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { fontFamily: FONT_STACK, width: '100%', height: 'auto' } }
		>
			{ items.map( ( item, i ) => {
				const h = ( item.value / maxValue ) * plotHeight;
				const x = PADDING_X + slotWidth * i + ( slotWidth - barWidth ) / 2;
				const y = PADDING_TOP + ( plotHeight - h );
				const icon = getIcon( item.icon );
				const low = isLowValue( item.value );
				return (
					<g key={ item.id }>
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
							y={ y - 8 }
							textAnchor="middle"
							fontSize={ low ? 14 : 20 }
							fontWeight="700"
							fill="#111"
						>
							{ item.value }%
						</text>
						{ icon && h > 40 && (
							<foreignObject x={ x + barWidth / 2 - 10 } y={ y + 8 } width={ 20 } height={ 20 }>
								<div style={ { color: '#fff' } }>
									<IconComponent icon={ icon } size={ 20 } />
								</div>
							</foreignObject>
						) }
						<text
							x={ x + barWidth / 2 }
							y={ HEIGHT - PADDING_BOTTOM + 24 }
							textAnchor="middle"
							fontSize={ 13 }
							fill="#374151"
						>
							{ item.title }
						</text>
					</g>
				);
			} ) }
		</svg>
	);
}
