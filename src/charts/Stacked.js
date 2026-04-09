import { Icon as IconComponent } from '@wordpress/components';
import { BORDER_RADIUS, NEUTRAL_GRAY, isLowValue } from './shared';
import { getIcon } from '../icons';

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = 20;
const BAR_HEIGHT = 56;
const BAR_Y = 60;

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
					const icon = getIcon( item.icon );
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
								<>
									{ icon && (
										<foreignObject
											x={ centerX - 10 }
											y={ BAR_Y + 8 }
											width={ 20 }
											height={ 20 }
										>
											<div style={ { color: '#fff' } }>
												<IconComponent
													icon={ icon }
													size={ 20 }
												/>
											</div>
										</foreignObject>
									) }
									<text
										x={ centerX }
										y={ BAR_Y + BAR_HEIGHT / 2 + 14 }
										textAnchor="middle"
										fontSize={ 14 }
										fontWeight="700"
										fill="#fff"
									>
										{ item.value }%
									</text>
								</>
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
			{ items.map( ( item, i ) => {
				let accum = 0;
				for ( let j = 0; j < i; j++ ) {
					accum += items[ j ].value;
				}
				const x =
					PADDING + ( ( accum + item.value / 2 ) / 100 ) * plotWidth;
				return (
					<text
						key={ `t-${ item.id }` }
						x={ x }
						y={ BAR_Y + BAR_HEIGHT + 22 }
						textAnchor="middle"
						fontSize={ 12 }
						fill="#374151"
					>
						{ item.title }
					</text>
				);
			} ) }
		</svg>
	);
}
