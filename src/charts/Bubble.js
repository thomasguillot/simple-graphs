import { Icon as IconComponent } from '@wordpress/components';
import { FONT_STACK, packBubbles, isLowValue } from './shared';
import { getIcon } from '../icons';

const WIDTH = 600;
const HEIGHT = 340;
const PADDING = 20;

export default function Bubble( { items } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const bubbles = packBubbles( items, {
		width: WIDTH - PADDING * 2,
		height: HEIGHT - PADDING * 2,
		padding: 12,
	} );

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { fontFamily: FONT_STACK, width: '100%', height: 'auto' } }
		>
			{ bubbles.map( ( b, i ) => {
				const item = items[ i ];
				const icon = getIcon( item.icon );
				const low = isLowValue( item.value );
				const fitsInside = b.r > 40;
				return (
					<g key={ item.id } transform={ `translate(${ PADDING } ${ PADDING })` }>
						<circle cx={ b.cx } cy={ b.cy } r={ b.r } fill={ item.color } />
						{ fitsInside ? (
							<>
								{ icon && (
									<foreignObject x={ b.cx - 12 } y={ b.cy - 24 } width={ 24 } height={ 24 }>
										<div style={ { color: '#fff' } }>
											<IconComponent icon={ icon } size={ 24 } />
										</div>
									</foreignObject>
								) }
								<text
									x={ b.cx }
									y={ b.cy + 8 }
									textAnchor="middle"
									fontSize={ 18 }
									fontWeight="700"
									fill="#fff"
								>
									{ item.value }%
								</text>
								<text x={ b.cx } y={ b.cy + 26 } textAnchor="middle" fontSize={ 11 } fill="#fff">
									{ item.title }
								</text>
							</>
						) : (
							<text
								x={ b.cx }
								y={ b.cy + b.r + 18 }
								textAnchor="middle"
								fontSize={ low ? 11 : 13 }
								fill="#374151"
							>
								{ item.title } { item.value }%
							</text>
						) }
					</g>
				);
			} ) }
		</svg>
	);
}
