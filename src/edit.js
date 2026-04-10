import { useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';
import { resolveVariation } from './charts/Chart';
import { resolveTrackColor, resolveBlockGap, resolveMinHeight } from './track-color';
import { extractTypographyStyle, extractTypographyClasses } from './typography';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { items, legendPosition, valueMode, valueMax, valuePrefix, valueSuffix } = attributes;
	const blockProps = useBlockProps();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );
	const chartHeight = resolveMinHeight( attributes );
	const variation = resolveVariation( blockProps.className );
	const showGapControl = variation === 'column' || variation === 'bar' || variation === 'stacked';

	// Split typography from block props so it only targets value labels.
	const { typography: typographyStyle, rest: wrapperStyle } = extractTypographyStyle( blockProps.style || {} );
	const { typographyClassName, restClassName } = extractTypographyClasses( blockProps.className || '' );

	// Hide/show the native block gap control based on style variation.
	useEffect( () => {
		const inspector = document.querySelector(
			`.block-editor-block-inspector`
		);
		if ( ! inspector ) {
			return;
		}
		const labels = inspector.querySelectorAll(
			'label, legend, .components-base-control__label'
		);
		for ( const label of labels ) {
			const text = label.textContent?.trim();
			if ( text === 'Block spacing' ) {
				const wrapper =
					label.closest( '.components-base-control' ) ||
					label.closest( 'fieldset' ) ||
					label.parentElement;
				if ( wrapper ) {
					wrapper.style.display = showGapControl ? '' : 'none';
				}
			}
		}
		const minHeightControl = inspector.querySelector(
			'.block-editor-height-control'
		);
		if ( minHeightControl ) {
			minHeightControl.style.marginTop = showGapControl
				? ''
				: '-16px';
		}
	}, [ showGapControl, clientId ] );

	return (
		<>
			<InspectorControls>
				<DataItemsPanel
					items={ items }
					onChange={ ( next ) => setAttributes( { items: next } ) }
					valueMode={ valueMode }
					valueMax={ valueMax }
					valuePrefix={ valuePrefix }
					valueSuffix={ valueSuffix }
					onChangeAttribute={ ( key, v ) =>
						setAttributes( { [ key ]: v } )
					}
					legendPosition={ legendPosition }
				/>
			</InspectorControls>
			<div
				{ ...blockProps }
				className={ restClassName }
				style={ wrapperStyle }
			>
				<Chart
					items={ items }
					className={ restClassName }
					trackColor={ trackColor }
					legendPosition={ legendPosition }
					blockGap={ blockGap }
					chartHeight={ chartHeight }
					valueMode={ valueMode }
					valueMax={ valueMax }
					valuePrefix={ valuePrefix }
					valueSuffix={ valueSuffix }
					typographyStyle={ typographyStyle }
					typographyClassName={ typographyClassName }
				/>
			</div>
		</>
	);
}
