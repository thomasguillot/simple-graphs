import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, BaseControl, ColorPalette } from '@wordpress/components';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';

export default function Edit( { attributes, setAttributes, className } ) {
	const { items, chartTitle, chartBackground } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Chart', 'simple-graphs' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Chart title', 'simple-graphs' ) }
						value={ chartTitle }
						onChange={ ( v ) => setAttributes( { chartTitle: v } ) }
						__nextHasNoMarginBottom
					/>
					<BaseControl label={ __( 'Chart background', 'simple-graphs' ) } __nextHasNoMarginBottom>
						<ColorPalette
							value={ chartBackground }
							onChange={ ( v ) => setAttributes( { chartBackground: v || '' } ) }
						/>
					</BaseControl>
				</PanelBody>
				<DataItemsPanel
					items={ items }
					onChange={ ( next ) => setAttributes( { items: next } ) }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				<Chart
					items={ items }
					chartTitle={ chartTitle }
					chartBackground={ chartBackground }
					className={ className }
				/>
			</div>
		</>
	);
}
