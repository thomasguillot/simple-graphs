import Column from './Column';
import Bar from './Bar';
import Pie from './Pie';
import Donut from './Donut';
import Stacked from './Stacked';
import Bubble from './Bubble';
import Legend from './Legend';

const VARIATIONS = {
	column: Column,
	bar: Bar,
	pie: Pie,
	donut: Donut,
	stacked: Stacked,
	bubble: Bubble,
};

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
	chartHeight,
} ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;

	const bodyClass = showLegend
		? 'simple-graphs-chart__body'
		: 'simple-graphs-chart__body simple-graphs-chart__body--no-legend';

	return (
		<div className={ bodyClass } style={ { height: chartHeight } }>
			<div className="simple-graphs-chart__plot">
				<Component
					items={ items }
					trackColor={ trackColor }
					blockGap={ blockGap }
				/>
			</div>
			{ showLegend && <Legend items={ items } /> }
		</div>
	);
}
