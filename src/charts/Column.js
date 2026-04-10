import { BORDER_RADIUS, isLowValue, contrastColor, isZeroGap } from './shared';

export default function Column( { items, trackColor, blockGap } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );
	const noGap = isZeroGap( blockGap );
	const itemRadius = noGap ? 0 : BORDER_RADIUS;

	return (
		<div
			className="simple-graphs-columns"
			style={ {
				display: 'grid',
				gridTemplateColumns: `repeat(${ items.length }, 1fr)`,
				gap: blockGap || 'var(--wp--preset--spacing--30, 1rem)',
				borderRadius: noGap ? BORDER_RADIUS : 0,
				overflow: noGap ? 'hidden' : 'visible',
			} }
		>
			{ items.map( ( item ) => {
				const pct = ( item.value / maxValue ) * 100;
				const low = isLowValue( item.value );
				const textOverBar = pct >= 15;
				const textBg = textOverBar ? item.color : trackColor;
				const textFill = textBg ? contrastColor( textBg ) : '#000';
				return (
					<div
						key={ item.id }
						style={ {
							position: 'relative',
						} }
					>
						{ trackColor && (
							<div
								style={ {
									position: 'absolute',
									inset: 0,
									borderRadius: itemRadius,
									background: trackColor,
								} }
							/>
						) }
						<div
							style={ {
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								height: `${ pct }%`,
								borderRadius: `${ BORDER_RADIUS }px ${ BORDER_RADIUS }px 0 0`,
								background: item.color,
							} }
						/>
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
