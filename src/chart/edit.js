import { useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TEMPLATE = [
	[ 'simple-graphs/data-item', { value: '40', title: 'Item A', backgroundColor: '#DB2777' } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item B', backgroundColor: '#0891B2' } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item C', backgroundColor: '#7C3AED' } ],
	[ 'simple-graphs/legend', {} ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data-item', 'simple-graphs/legend' ];

function resolveVariation( className = '' ) {
	const match = className.match( /is-style-(column|bar|pie|donut|stacked|bubble)/ );
	return match ? match[ 1 ] : 'column';
}

export default function Edit( { attributes, setAttributes } ) {
	const { valueMode, valuePrefix, valueSuffix, valueMax } = attributes;
	const blockProps = useBlockProps();
	const variation = resolveVariation( blockProps.className );
	const isCustom = valueMode === 'custom';

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'simple-graphs-chart__items' },
		{
			template: TEMPLATE,
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: variation === 'bar' ? 'vertical' : 'horizontal',
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Values', 'simple-graphs' ) }>
					<ToggleGroupControl
						label={ __( 'Value format', 'simple-graphs' ) }
						value={ valueMode }
						onChange={ ( v ) => setAttributes( { valueMode: v } ) }
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="percentage"
							label={ __( 'Percentage', 'simple-graphs' ) }
						/>
						<ToggleGroupControlOption
							value="custom"
							label={ __( 'Custom', 'simple-graphs' ) }
						/>
					</ToggleGroupControl>
					{ isCustom && (
						<>
							<NumberControl
								label={ __( 'Max value', 'simple-graphs' ) }
								value={ valueMax || '' }
								onChange={ ( v ) =>
									setAttributes( { valueMax: Math.max( 0, Number( v ) || 0 ) } )
								}
								min={ 0 }
								step={ 1 }
								placeholder={ __( 'Auto', 'simple-graphs' ) }
								help={ __( 'Reference maximum for sizing. Leave empty to auto-detect.', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Prefix', 'simple-graphs' ) }
								value={ valuePrefix }
								onChange={ ( v ) => setAttributes( { valuePrefix: v } ) }
								placeholder={ __( 'e.g. $', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Suffix', 'simple-graphs' ) }
								value={ valueSuffix }
								onChange={ ( v ) => setAttributes( { valueSuffix: v } ) }
								placeholder={ __( 'e.g. k', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
