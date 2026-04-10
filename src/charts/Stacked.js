import { BORDER_RADIUS, NEUTRAL_GRAY, isLowValue, contrastColor, isZeroGap } from './shared';

export default function Stacked( { items, blockGap } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const total = items.reduce( ( s, i ) => s + i.value, 0 );
	const remainder = total < 100 ? 100 - total : 0;
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
							fontSize: low ? 12 : 20,
							color: contrastColor( item.color ),
						} }
					>
						{ ! low && `${ item.value }%` }
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
