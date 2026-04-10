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
	legendPosition = 'side',
	blockGap,
	chartHeight,
	valueMode = 'percentage',
	valueMax = 0,
	valuePrefix = '',
	valueSuffix = '',
} ) {
	const variation = resolveVariation( className );
	const Component = VARIATIONS[ variation ] || Column;

	const bodyClasses = [ 'simple-graphs-chart__body' ];
	if ( legendPosition === 'none' ) {
		bodyClasses.push( 'simple-graphs-chart__body--no-legend' );
	}
	if ( legendPosition === 'below' ) {
		bodyClasses.push( 'simple-graphs-chart__body--below' );
	}

	return (
		<div
			className={ bodyClasses.join( ' ' ) }
			style={ { height: chartHeight, minHeight: 'fit-content' } }
		>
			<div className="simple-graphs-chart__plot">
				<Component
					items={ items }
					trackColor={ trackColor }
					blockGap={ blockGap }
					valueMode={ valueMode }
					valueMax={ valueMax }
					valuePrefix={ valuePrefix }
					valueSuffix={ valueSuffix }
					legendPosition={ legendPosition }
				/>
			</div>
			{ legendPosition === 'side' && <Legend items={ items } /> }
		</div>
	);
}
