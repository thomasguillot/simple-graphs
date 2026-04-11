import { createBlock } from '@wordpress/blocks';
import metadata from './block.json';

// v2 attribute shape (pre-Data-block refactor): chart owned value format + max,
// and carried is-style-* for the chart variation.
const v2Attributes = {
	...metadata.attributes,
	valueMode: { type: 'string', default: 'percentage' },
	valuePrefix: { type: 'string', default: '' },
	valueSuffix: { type: 'string', default: '' },
	valueMax: { type: 'number', default: 0 },
};

const v2Supports = {
	...metadata.supports,
};

const CHART_STYLE_RE = /\bis-style-(column|bar|pie|donut|stacked|bubble)\b/;

function splitChartStyleClass( className ) {
	if ( ! className ) {
		return { rest: '', styleClass: null };
	}
	const match = className.match( CHART_STYLE_RE );
	if ( ! match ) {
		return { rest: className, styleClass: null };
	}
	const styleClass = match[ 0 ];
	const rest = className
		.split( /\s+/ )
		.filter( ( c ) => c && c !== styleClass )
		.join( ' ' );
	return { rest, styleClass };
}

const deprecated = [
	// Intermediate v2 shape: Data block exists but chart still owns value format
	// and the is-style-* class.
	{
		attributes: v2Attributes,
		supports: v2Supports,
		save: () => null,
		isEligible( attributes, innerBlocks ) {
			const hasDataBlock = innerBlocks.some(
				( b ) => b.name === 'simple-graphs/data'
			);
			if ( ! hasDataBlock ) {
				return false;
			}
			const hasChartValueAttrs =
				attributes.valueMode !== undefined ||
				attributes.valuePrefix !== undefined ||
				attributes.valueSuffix !== undefined ||
				attributes.valueMax !== undefined;
			const hasChartStyleClass = CHART_STYLE_RE.test(
				attributes.className || ''
			);
			return hasChartValueAttrs || hasChartStyleClass;
		},
		migrate( attributes, innerBlocks ) {
			const {
				valueMode,
				valuePrefix,
				valueSuffix,
				valueMax: _drop,
				className,
				...rest
			} = attributes;

			const { rest: chartClassRest, styleClass } = splitChartStyleClass(
				className || ''
			);

			const newInner = innerBlocks.map( ( block ) => {
				if ( block.name !== 'simple-graphs/data' ) {
					return block;
				}
				const dataAttrs = { ...block.attributes };
				if ( valueMode !== undefined && dataAttrs.valueMode === undefined ) {
					dataAttrs.valueMode = valueMode;
				}
				if ( valuePrefix !== undefined && ! dataAttrs.valuePrefix ) {
					dataAttrs.valuePrefix = valuePrefix;
				}
				if ( valueSuffix !== undefined && ! dataAttrs.valueSuffix ) {
					dataAttrs.valueSuffix = valueSuffix;
				}
				if ( styleClass ) {
					const existing = dataAttrs.className || '';
					dataAttrs.className = existing
						? `${ existing } ${ styleClass }`.trim()
						: styleClass;
				}
				return createBlock(
					'simple-graphs/data',
					dataAttrs,
					block.innerBlocks
				);
			} );

			const migratedAttributes = { ...rest };
			if ( chartClassRest ) {
				migratedAttributes.className = chartClassRest;
			}
			return [ migratedAttributes, newInner ];
		},
	},
	// Legacy shape: data-items as direct children of chart.
	{
		attributes: v2Attributes,
		supports: v2Supports,
		save: () => null,
		isEligible( _attributes, innerBlocks ) {
			return innerBlocks.some(
				( b ) => b.name === 'simple-graphs/data-item'
			);
		},
		migrate( attributes, innerBlocks ) {
			const dataItems = innerBlocks.filter(
				( b ) => b.name === 'simple-graphs/data-item'
			);
			const legend = innerBlocks.find(
				( b ) => b.name === 'simple-graphs/legend'
			);

			const {
				valueMode,
				valuePrefix,
				valueSuffix,
				valueMax: _drop,
				className,
				...rest
			} = attributes;

			// Transfer is-style-* from chart className to the new Data block.
			const { rest: chartClassRest, styleClass } = splitChartStyleClass(
				className || ''
			);

			const dataAttrs = {
				lock: { move: true, remove: true },
			};
			if ( valueMode ) {
				dataAttrs.valueMode = valueMode;
			}
			if ( valuePrefix ) {
				dataAttrs.valuePrefix = valuePrefix;
			}
			if ( valueSuffix ) {
				dataAttrs.valueSuffix = valueSuffix;
			}
			if ( styleClass ) {
				dataAttrs.className = styleClass;
			}

			const dataBlock = createBlock(
				'simple-graphs/data',
				dataAttrs,
				dataItems
			);
			const newInner = [ dataBlock ];
			if ( legend ) {
				newInner.push( legend );
			}

			const migratedAttributes = { ...rest };
			if ( chartClassRest ) {
				migratedAttributes.className = chartClassRest;
			}
			return [ migratedAttributes, newInner ];
		},
	},
];

export default deprecated;
