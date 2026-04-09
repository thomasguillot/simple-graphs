import { useBlockProps } from '@wordpress/block-editor';
import Chart from './charts/Chart';
import { resolveTrackColor } from './track-color';

export default function save( { attributes } ) {
	const { items } = attributes;
	const blockProps = useBlockProps.save();
	const trackColor = resolveTrackColor( attributes );
	return (
		<div { ...blockProps }>
			<Chart
				items={ items }
				className={ blockProps.className }
				trackColor={ trackColor }
			/>
		</div>
	);
}
