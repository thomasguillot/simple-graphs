import { BORDER_RADIUS, isLowValue, contrastColor, isZeroGap } from './shared';

export default function Bar( { items, trackColor, blockGap } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );
	const noGap = isZeroGap( blockGap );
	const itemRadius = noGap ? 0 : BORDER_RADIUS;

	return (
		<div
			className="simple-graphs-bars"
			style={ {
				display: 'grid',
				gridTemplateColumns: '1fr',
				gridTemplateRows: `repeat(${ items.length }, 1fr)`,
				gap: blockGap || 'var(--wp--preset--spacing--30, 1rem)',
				borderRadius: noGap ? BORDER_RADIUS : 0,
				overflow: noGap ? 'hidden' : 'visible',
			} }
		>
			{ items.map( ( item ) => {
				const pct = ( item.value / maxValue ) * 100;
				const low = isLowValue( item.value );
				return (
					<div
						key={ item.id }
						style={ { position: 'relative' } }
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
								top: 0,
								left: 0,
								bottom: 0,
								width: `${ pct }%`,
								borderRadius: noGap ? `0 ${ BORDER_RADIUS }px ${ BORDER_RADIUS }px 0` : BORDER_RADIUS,
								background: item.color,
							} }
						/>
						<span
							style={ {
								position: 'absolute',
								left: 16,
								top: '50%',
								transform: 'translateY(-50%)',
								fontSize: low ? 12 : 18,
								color: contrastColor( item.color ),
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
