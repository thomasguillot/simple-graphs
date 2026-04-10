import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';
import { resolveVariation } from './charts/Chart';
import { resolveTrackColor, resolveBlockGap, resolveMinHeight } from './track-color';

export default function Edit( { attributes, setAttributes } ) {
	const { items, showLegend, blockGap: blockGapAttr } = attributes;
	const blockProps = useBlockProps();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );
	const chartHeight = resolveMinHeight( attributes );
	const variation = resolveVariation( blockProps.className );
	const showGapControl = variation === 'column' || variation === 'bar';

	return (
		<>
			<InspectorControls>
				<DataItemsPanel
					items={ items }
					onChange={ ( next ) => setAttributes( { items: next } ) }
					showLegend={ showLegend }
					onToggleLegend={ ( v ) =>
						setAttributes( { showLegend: v } )
					}
				/>
				{ showGapControl && (
					<PanelBody
						title={ __( 'Spacing', 'simple-graphs' ) }
						initialOpen={ false }
					>
						<TextControl
							label={ __( 'Gap between items', 'simple-graphs' ) }
							help={ __(
								'CSS value, e.g. 16px, 1rem, or a CSS variable.',
								'simple-graphs'
							) }
							value={ blockGapAttr || '' }
							onChange={ ( v ) =>
								setAttributes( { blockGap: v } )
							}
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				) }
			</InspectorControls>
			<div { ...blockProps }>
				<Chart
					items={ items }
					className={ blockProps.className }
					trackColor={ trackColor }
					showLegend={ showLegend }
					blockGap={ blockGap }
					chartHeight={ chartHeight }
				/>
			</div>
		</>
	);
}
