import { BORDER_RADIUS, NEUTRAL_GRAY, computeTotal, isLowValue, contrastColor, isZeroGap, formatValue } from './shared';

export default function Stacked( { items, blockGap, valueMode = 'percentage', valuePrefix = '', valueSuffix = '' } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const isPercentage = valueMode === 'percentage';
	const total = computeTotal( items );
	const remainder = isPercentage && total < 100 ? 100 - total : 0;
	const noGap = isZeroGap( blockGap );

	return (
		<div
			className="simple-graphs-stacked"
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: blockGap || 'var(--wp--preset--spacing--30, 1rem)',
				borderRadius: BORDER_RADIUS,
				overflow: noGap ? 'hidden' : 'visible',
				height: '100%',
			} }
		>
			{ items.map( ( item ) => {
				const low = isLowValue( item.value );
				return (
					<div
						key={ item.id }
						style={ {
							flex: `${ item.value } 0 0%`,
							borderRadius: noGap ? 0 : BORDER_RADIUS,
							background: item.color,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							paddingLeft: 16,
							color: contrastColor( item.color ),
						} }
					>
						{ ! low && formatValue( item.value, { valueMode, valuePrefix, valueSuffix } ) }
					</div>
				);
			} ) }
			{ remainder > 0 && (
				<div
					style={ {
						flex: `${ remainder } 0 0%`,
						borderRadius: noGap ? 0 : BORDER_RADIUS,
						background: NEUTRAL_GRAY,
					} }
				/>
			) }
		</div>
	);
}
