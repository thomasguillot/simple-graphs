import { useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';
import { resolveVariation } from './charts/Chart';
import { resolveTrackColor, resolveBlockGap, resolveMinHeight } from './track-color';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { items, showLegend } = attributes;
	const blockProps = useBlockProps();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );
	const chartHeight = resolveMinHeight( attributes );
	const variation = resolveVariation( blockProps.className );
	const showGapControl = variation === 'column' || variation === 'bar' || variation === 'stacked';

	// Hide/show the native block gap control based on style variation.
	useEffect( () => {
		const inspector = document.querySelector(
			`.block-editor-block-inspector`
		);
		if ( ! inspector ) {
			return;
		}
		// The block gap control is inside a fieldset with the "Block spacing" label.
		const labels = inspector.querySelectorAll(
			'label, legend, .components-base-control__label'
		);
		for ( const label of labels ) {
			if ( label.textContent?.trim() === 'Block spacing' ) {
				const wrapper =
					label.closest( '.components-base-control' ) ||
					label.closest( 'fieldset' ) ||
					label.parentElement;
				if ( wrapper ) {
					wrapper.style.display = showGapControl ? '' : 'none';
				}
			}
		}
	}, [ showGapControl, clientId ] );

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
					chartHeight={ chartHeight }
				/>
			</div>
		</>
	);
}
