import { BORDER_RADIUS, packBubbles, isLowValue, contrastColor, formatValue } from './shared';

const WIDTH = 500;
const HEIGHT = 300;
const PADDING = 20;

export default function Bubble( { items, trackColor, valueMode = 'percentage', valuePrefix = '', valueSuffix = '', typographyStyle = {} } ) {
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
		>
			{ trackColor && (
				<rect
					x={ 0 }
					y={ 0 }
					width={ WIDTH }
					height={ HEIGHT }
					rx={ BORDER_RADIUS }
					fill={ trackColor }
				/>
			) }
			{ bubbles.map( ( b, i ) => {
				const item = items[ i ];
				const low = isLowValue( item.value );
				const fitsInside = b.r > 30;
				return (
					<g
						key={ item.id }
						transform={ `translate(${ PADDING } ${ PADDING })` }
					>
						<circle
							cx={ b.cx }
							cy={ b.cy }
							r={ b.r }
							fill={ item.color }
						/>
						{ fitsInside ? (
							<text
								x={ b.cx }
								y={ b.cy + 7 }
								textAnchor="middle"
								fill={ contrastColor( item.color ) }
								fontFamily={ typographyStyle.fontFamily }
								fontSize={ typographyStyle.fontSize }
								fontWeight={ typographyStyle.fontWeight }
								fontStyle={ typographyStyle.fontStyle }
								letterSpacing={ typographyStyle.letterSpacing }
							>
								{ formatValue( item.value, { valueMode, valuePrefix, valueSuffix } ) }
							</text>
						) : (
							! low && (
								<text
									x={ b.cx }
									y={ b.cy + b.r + 16 }
									textAnchor="middle"
									fontWeight={ typographyStyle.fontWeight || 600 }
									fill="#000"
									fontFamily={ typographyStyle.fontFamily }
									fontSize={ typographyStyle.fontSize }
									fontStyle={ typographyStyle.fontStyle }
									letterSpacing={ typographyStyle.letterSpacing }
								>
									{ formatValue( item.value, { valueMode, valuePrefix, valueSuffix } ) }
								</text>
							)
						) }
					</g>
				);
			} ) }
		</svg>
	);
}
