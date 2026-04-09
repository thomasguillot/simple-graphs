import { FONT_STACK, NEUTRAL_GRAY } from './shared';

const WIDTH = 500;
const HEIGHT = 420;
const CX = WIDTH / 2;
const CY = 200;
const R = 130;
const STROKE = 36;

export default function Donut( { items, chartTitle } ) {
	if ( items.length === 0 ) {
		return null;
	}
	const circumference = 2 * Math.PI * R;
	let offset = 0;
	const total = items.reduce( ( s, i ) => s + i.value, 0 );
	const largest = items.reduce( ( a, b ) => ( a.value > b.value ? a : b ), items[ 0 ] );
	const centerLabel = chartTitle || `${ largest.value }%`;

	return (
		<svg
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			preserveAspectRatio="xMidYMid meet"
			style={ { fontFamily: FONT_STACK, width: '100%', height: 'auto' } }
		>
			{ total < 100 && (
				<circle cx={ CX } cy={ CY } r={ R } fill="none" stroke={ NEUTRAL_GRAY } strokeWidth={ STROKE } />
			) }
			<g transform={ `rotate(-90 ${ CX } ${ CY })` }>
				{ items.map( ( item ) => {
					const len = ( item.value / 100 ) * circumference;
					const seg = (
						<circle
							key={ item.id }
							cx={ CX }
							cy={ CY }
							r={ R }
							fill="none"
							stroke={ item.color }
							strokeWidth={ STROKE }
							strokeDasharray={ `${ len } ${ circumference - len }` }
							strokeDashoffset={ -offset }
						/>
					);
					offset += len;
					return seg;
				} ) }
			</g>
			<text x={ CX } y={ CY + 8 } textAnchor="middle" fontSize={ 24 } fontWeight="700" fill="#111">
				{ centerLabel }
			</text>
			{ items.map( ( item, i ) => (
				<g key={ `legend-${ item.id }` } transform={ `translate(${ 40 + i * 90 } ${ HEIGHT - 30 })` }>
					<rect width={ 12 } height={ 12 } fill={ item.color } rx={ 2 } />
					<text x={ 18 } y={ 10 } fontSize={ 12 } fill="#374151">
						{ item.title } { item.value }%
					</text>
				</g>
			) ) }
		</svg>
	);
}
