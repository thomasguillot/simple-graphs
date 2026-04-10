import { BORDER_RADIUS, isLowValue, contrastColor, isZeroGap, formatValue, resolveMaxValue } from './shared';

export default function Column( { items, trackColor, blockGap, valueMode = 'percentage', valueMax = 0, valuePrefix = '', valueSuffix = '' } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = resolveMaxValue( items, valueMode, valueMax );
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
								borderRadius: noGap ? `${ BORDER_RADIUS }px ${ BORDER_RADIUS }px 0 0` : BORDER_RADIUS,
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
								color: textFill,
							} }
						>
							{ formatValue( item.value, { valueMode, valuePrefix, valueSuffix } ) }
						</span>
					</div>
				);
			} ) }
		</div>
	);
}
