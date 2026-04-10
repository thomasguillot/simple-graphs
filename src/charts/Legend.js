import { Icon as IconComponent } from '@wordpress/components';
import { getIcon } from '../icons';
import { contrastColor } from './shared';

export default function Legend( { items } ) {
	return (
		<div className="simple-graphs-legend">
			{ items.map( ( item ) => {
				const icon = getIcon( item.icon );
				return (
					<div
						key={ item.id }
						className="simple-graphs-legend__item"
					>
						<span
							className="simple-graphs-legend__swatch"
							style={ { background: item.color } }
						>
							{ icon && (
								<IconComponent
									icon={ icon }
									size={ 24 }
									style={ { fill: contrastColor( item.color ) } }
								/>
							) }
						</span>
						<span className="simple-graphs-legend__label">
							{ item.title }
						</span>
					</div>
				);
			} ) }
		</div>
	);
}
