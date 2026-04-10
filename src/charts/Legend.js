import { Icon as IconComponent } from '@wordpress/components';
import { getIcon } from '../icons';

const RECT_SIZE = 32;
const ICON_SIZE = 24;
const GAP = 8;

export default function Legend( { items } ) {
	return (
		<div className="simple-graphs-legend">
			{ items.map( ( item ) => {
				const icon = getIcon( item.icon );
				return (
					<div
						key={ item.id }
						className="simple-graphs-legend__item"
						style={ {
							display: 'flex',
							alignItems: 'center',
							gap: GAP,
							marginBottom: GAP,
						} }
					>
						<span
							style={ {
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: RECT_SIZE,
								height: RECT_SIZE,
								borderRadius: 6,
								background: item.color,
								flexShrink: 0,
							} }
						>
							{ icon && (
								<IconComponent
									icon={ icon }
									size={ ICON_SIZE }
									style={ { fill: '#fff' } }
								/>
							) }
						</span>
						<span
							className="simple-graphs-legend__label"
							style={ { fontSize: 13, color: '#374151' } }
						>
							{ item.title }
						</span>
					</div>
				);
			} ) }
		</div>
	);
}
