import Column from './Column';
import Bar from './Bar';
import Pie from './Pie';
import Donut from './Donut';
import Stacked from './Stacked';
import Bubble from './Bubble';
import { FONT_STACK } from './shared';

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

export default function Chart( { items, className } ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;

	return (
		<div className="simple-graphs-chart" style={ { fontFamily: FONT_STACK } }>
			<Component items={ items } />
		</div>
	);
}
