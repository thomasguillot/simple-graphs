import { pieSlices, arcPath, polarToCartesian, packBubbles } from '../shared/utils';

const SIZE = 400;

function Pie( { items } ) {
	const slices = pieSlices( items );
	return (
		<svg viewBox={ `0 0 ${ SIZE } ${ SIZE }` } style={ { maxWidth: '100%', height: 'auto' } }>
			{ slices.map( ( s, i ) => {
				const item = items[ i ];
				const full = s.endAngle - s.startAngle >= Math.PI * 2 - 0.0001;
				if ( full ) {
					return (
						<circle
							key={ item.clientId }
							cx={ SIZE / 2 }
							cy={ SIZE / 2 }
							r={ SIZE / 2 - 10 }
							fill={ item.color }
						/>
					);
				}
				const d = arcPath( SIZE / 2, SIZE / 2, SIZE / 2 - 10, s.startAngle, s.endAngle );
				return <path key={ item.clientId } d={ d } fill={ item.color } />;
			} ) }
		</svg>
	);
}

function Donut( { items } ) {
	const slices = pieSlices( items );
	const cx = SIZE / 2;
	const cy = SIZE / 2;
	const outer = SIZE / 2 - 10;
	const inner = outer * 0.6;
	return (
		<svg viewBox={ `0 0 ${ SIZE } ${ SIZE }` } style={ { maxWidth: '100%', height: 'auto' } }>
			{ slices.map( ( s, i ) => {
				const item = items[ i ];
				const full = s.endAngle - s.startAngle >= Math.PI * 2 - 0.0001;
				if ( full ) {
					const d = [
						`M ${ cx + outer } ${ cy }`,
						`A ${ outer } ${ outer } 0 1 1 ${ cx - outer } ${ cy }`,
						`A ${ outer } ${ outer } 0 1 1 ${ cx + outer } ${ cy }`,
						`M ${ cx + inner } ${ cy }`,
						`A ${ inner } ${ inner } 0 1 0 ${ cx - inner } ${ cy }`,
						`A ${ inner } ${ inner } 0 1 0 ${ cx + inner } ${ cy }`,
						'Z',
					].join( ' ' );
					return <path key={ item.clientId } d={ d } fill={ item.color } fillRule="evenodd" />;
				}
				const outerStart = polarToCartesian( cx, cy, outer, s.startAngle );
				const outerEnd = polarToCartesian( cx, cy, outer, s.endAngle );
				const innerStart = polarToCartesian( cx, cy, inner, s.startAngle );
				const innerEnd = polarToCartesian( cx, cy, inner, s.endAngle );
				const largeArc = s.endAngle - s.startAngle > Math.PI ? 1 : 0;
				const d = [
					`M ${ outerStart.x } ${ outerStart.y }`,
					`A ${ outer } ${ outer } 0 ${ largeArc } 1 ${ outerEnd.x } ${ outerEnd.y }`,
					`L ${ innerEnd.x } ${ innerEnd.y }`,
					`A ${ inner } ${ inner } 0 ${ largeArc } 0 ${ innerStart.x } ${ innerStart.y }`,
					'Z',
				].join( ' ' );
				return <path key={ item.clientId } d={ d } fill={ item.color } />;
			} ) }
		</svg>
	);
}

function Bubble( { items } ) {
	const bubbles = packBubbles( items, { width: SIZE - 40, height: SIZE - 40, padding: 12 } );
	return (
		<svg viewBox={ `0 0 ${ SIZE } ${ SIZE }` } style={ { maxWidth: '100%', height: 'auto' } }>
			<g transform="translate(20, 20)">
				{ bubbles.map( ( b, i ) => {
					const item = items[ i ];
					return <circle key={ item.clientId } cx={ b.cx } cy={ b.cy } r={ b.r } fill={ item.color } />;
				} ) }
			</g>
		</svg>
	);
}

export default function CircularChart( { variation, items } ) {
	if ( ! items || items.length === 0 ) {
		return null;
	}
	if ( variation === 'donut' ) {
		return <Donut items={ items } />;
	}
	if ( variation === 'bubble' ) {
		return <Bubble items={ items } />;
	}
	return <Pie items={ items } />;
}
