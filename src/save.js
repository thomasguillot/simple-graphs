import { useBlockProps } from '@wordpress/block-editor';
import Chart from './charts/Chart';

export default function save( { attributes } ) {
	const { items, chartTitle, chartBackground } = attributes;
	const blockProps = useBlockProps.save();
	return (
		<div { ...blockProps }>
			<Chart
				items={ items }
				chartTitle={ chartTitle }
				chartBackground={ chartBackground }
				className={ blockProps.className }
			/>
		</div>
	);
}
