import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import DataItemsPanel from './components/DataItemsPanel';
import Chart from './charts/Chart';

export default function Edit( { attributes, setAttributes } ) {
	const { items } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<DataItemsPanel
					items={ items }
					onChange={ ( next ) => setAttributes( { items: next } ) }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				<Chart items={ items } className={ blockProps.className } />
			</div>
		</>
	);
}
