import { BORDER_RADIUS, isLowValue, contrastColor, isZeroGap, formatValue, resolveMaxValue } from './shared';

export default function Bar( { items, trackColor, blockGap, valueMode = 'percentage', valueMax = 0, valuePrefix = '', valueSuffix = '', legendPosition = 'side', typographyStyle = {}, typographyClassName = '' } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const maxValue = resolveMaxValue( items, valueMode, valueMax );
	const noGap = isZeroGap( blockGap );
	const itemRadius = noGap ? 0 : BORDER_RADIUS;
	const showBelow = legendPosition === 'below';

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
					<div key={ item.id }>
						{ showBelow && item.title && (
							<span className="simple-graphs-labels-below__label">
								{ item.title }
							</span>
						) }
						<div style={ { position: 'relative', flex: 1, minHeight: 0 } }>
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
								className={ typographyClassName || undefined }
								style={ {
									position: 'absolute',
									left: 16,
									top: '50%',
									transform: 'translateY(-50%)',
									color: contrastColor( item.color ),
									...typographyStyle,
								} }
							>
								{ formatValue( item.value, { valueMode, valuePrefix, valueSuffix } ) }
							</span>
						</div>
					</div>
				);
			} ) }
		</div>
	);
}
