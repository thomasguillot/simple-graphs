import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';
import { resolveTrackColor, resolveBlockGap } from './track-color';

export default function Edit( { attributes, setAttributes } ) {
	const { items, showLegend } = attributes;
	const blockProps = useBlockProps();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );

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
			</InspectorControls>
			<div { ...blockProps }>
				<Chart
					items={ items }
					className={ blockProps.className }
					trackColor={ trackColor }
					showLegend={ showLegend }
					blockGap={ blockGap }
				/>
			</div>
		</>
	);
}
