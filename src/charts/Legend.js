import { Icon as IconComponent } from '@wordpress/components';
import { getIcon } from '../icons';

const CIRCLE_SIZE = 24;
const ROW_GAP = 10;

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
							gap: 8,
							marginBottom: ROW_GAP,
						} }
					>
						<span
							style={ {
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: CIRCLE_SIZE,
								height: CIRCLE_SIZE,
								borderRadius: '50%',
								background: item.color,
								flexShrink: 0,
							} }
						>
							{ icon && (
								<IconComponent
									icon={ icon }
									size={ 14 }
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
