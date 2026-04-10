import { BORDER_RADIUS, isLowValue, contrastColor } from './shared';

const HEIGHT = 320;

export default function Column( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<div
			className="simple-graphs-columns"
			style={ {
				display: 'grid',
				gridTemplateColumns: `repeat(${ items.length }, 1fr)`,
				gap: 'var(--wp--style--block-gap, 16px)',
				alignItems: 'end',
			} }
		>
			{ items.map( ( item ) => {
				const h = ( item.value / maxValue ) * HEIGHT;
				const low = isLowValue( item.value );
				const textOverBar = h >= 32;
				const textBg = textOverBar ? item.color : trackColor;
				const textFill = textBg ? contrastColor( textBg ) : '#000';
				return (
					<div key={ item.id } style={ { position: 'relative' } }>
						<svg
							viewBox={ `0 0 100 ${ HEIGHT }` }
							preserveAspectRatio="none"
							style={ {
								width: '100%',
								height: HEIGHT,
								display: 'block',
							} }
						>
							{ trackColor && (
								<rect
									x={ 0 }
									y={ 0 }
									width={ 100 }
									height={ HEIGHT }
									rx={ BORDER_RADIUS }
									fill={ trackColor }
								/>
							) }
							<rect
								x={ 0 }
								y={ HEIGHT - h }
								width={ 100 }
								height={ h }
								rx={ BORDER_RADIUS }
								fill={ item.color }
							/>
						</svg>
						<span
							style={ {
								position: 'absolute',
								bottom: 16,
								left: 0,
								right: 0,
								textAlign: 'center',
								fontSize: low ? 12 : 16,
								color: textFill,
							} }
						>
							{ item.value }%
						</span>
					</div>
				);
			} ) }
		</div>
	);
}
