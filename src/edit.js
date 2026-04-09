import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';
import { resolveTrackColor } from './track-color';

export default function Edit( { attributes, setAttributes } ) {
	const { items } = attributes;
	const blockProps = useBlockProps();
	const trackColor = resolveTrackColor( attributes );

	return (
		<>
			<InspectorControls>
				<DataItemsPanel
					items={ items }
					onChange={ ( next ) => setAttributes( { items: next } ) }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				<Chart
					items={ items }
					className={ blockProps.className }
					trackColor={ trackColor }
				/>
			</div>
		</>
	);
}
