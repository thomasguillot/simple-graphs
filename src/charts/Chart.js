import Column from './Column';
import Bar from './Bar';
import Pie from './Pie';
import Donut from './Donut';
import Stacked from './Stacked';
import Bubble from './Bubble';
import { BORDER_RADIUS } from './shared';

const VARIATIONS = {
	column: Column,
	bar: Bar,
	pie: Pie,
	donut: Donut,
	stacked: Stacked,
	bubble: Bubble,
};

// Variations that get a padded background card instead of per-item tracks.
const CARD_VARIATIONS = new Set( [ 'pie', 'donut', 'bubble' ] );

export function resolveVariation( className = '' ) {
	const match = className.match(
		/is-style-(column|bar|pie|donut|stacked|bubble)/
	);
	return match ? match[ 1 ] : 'column';
}

export default function Chart( { items, className, trackColor } ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;
	const useCard = CARD_VARIATIONS.has( variation );

	// Column/Bar receive trackColor for per-item tracks.
	// Pie/Donut/Bubble get a background card wrapper instead.
	const chartEl = useCard ? (
		<Component items={ items } />
	) : (
		<Component items={ items } trackColor={ trackColor } />
	);

	return (
		<div className="simple-graphs-chart">
			{ useCard && trackColor ? (
				<div
					className="simple-graphs-chart__card"
					style={ {
						background: trackColor,
						borderRadius: BORDER_RADIUS,
						padding: 24,
					} }
				>
					{ chartEl }
				</div>
			) : (
				chartEl
			) }
		</div>
	);
}
