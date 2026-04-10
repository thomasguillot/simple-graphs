import Column from './Column';
import Bar from './Bar';
import Pie from './Pie';
import Donut from './Donut';
import Stacked from './Stacked';
import Bubble from './Bubble';
import Legend from './Legend';
import { BORDER_RADIUS } from './shared';

const VARIATIONS = {
	column: Column,
	bar: Bar,
	pie: Pie,
	donut: Donut,
	stacked: Stacked,
	bubble: Bubble,
};

const CARD_VARIATIONS = new Set( [ 'pie', 'donut', 'bubble' ] );

export function resolveVariation( className = '' ) {
	const match = className.match(
		/is-style-(column|bar|pie|donut|stacked|bubble)/
	);
	return match ? match[ 1 ] : 'column';
}

export default function Chart( {
	items,
	className,
	trackColor,
	showLegend = true,
	blockGap,
} ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;
	const useCard = CARD_VARIATIONS.has( variation );

	const chartEl = useCard ? (
		<Component items={ items } />
	) : (
		<Component items={ items } trackColor={ trackColor } blockGap={ blockGap } />
	);

	const wrappedChart =
		useCard && trackColor ? (
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
		);

	const bodyClass = showLegend
		? 'simple-graphs-chart__body'
		: 'simple-graphs-chart__body simple-graphs-chart__body--no-legend';

	return (
		<div className="simple-graphs-chart">
			<div className={ bodyClass }>
				<div className="simple-graphs-chart__plot">
					{ wrappedChart }
				</div>
				{ showLegend && <Legend items={ items } /> }
			</div>
		</div>
	);
}
