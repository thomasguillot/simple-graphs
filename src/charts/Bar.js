import { BORDER_RADIUS, isLowValue, contrastColor } from './shared';

const BAR_HEIGHT = 40;

export default function Bar( { items, trackColor } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = Math.max( 100, ...items.map( ( i ) => i.value ) );

	return (
		<div
			className="simple-graphs-bars"
			style={ {
				display: 'grid',
				gridTemplateColumns: '1fr',
				gap: 'var(--wp--style--block-gap, 16px)',
			} }
		>
			{ items.map( ( item ) => {
				const pct = ( item.value / maxValue ) * 100;
				const low = isLowValue( item.value );
				return (
					<div
						key={ item.id }
						style={ { position: 'relative', height: BAR_HEIGHT } }
					>
						{ trackColor && (
							<div
								style={ {
									position: 'absolute',
									inset: 0,
									borderRadius: BORDER_RADIUS,
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
								borderRadius: BORDER_RADIUS,
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
