import Column from './Column';
import Bar from './Bar';
import Pie from './Pie';
import Donut from './Donut';
import Stacked from './Stacked';
import Bubble from './Bubble';
import { BORDER_RADIUS, FONT_STACK } from './shared';

const VARIATIONS = { column: Column, bar: Bar, pie: Pie, donut: Donut, stacked: Stacked, bubble: Bubble };

export function resolveVariation( className = '' ) {
	const match = className.match( /is-style-(column|bar|pie|donut|stacked|bubble)/ );
	return match ? match[ 1 ] : 'column';
}

export default function Chart( { items, chartTitle, chartBackground, className } ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;

	return (
		<div className="simple-graphs-chart" style={ { fontFamily: FONT_STACK } }>
			{ chartTitle && (
				<h3 className="simple-graphs-chart__title" style={ { margin: '0 0 12px', fontSize: 18 } }>
					{ chartTitle }
				</h3>
			) }
			<div
				className="simple-graphs-chart__plot"
				style={ {
					background: chartBackground || 'transparent',
					borderRadius: chartBackground ? BORDER_RADIUS : 0,
					padding: chartBackground ? 20 : 0,
				} }
			>
				<Component items={ items } />
			</div>
		</div>
	);
}
