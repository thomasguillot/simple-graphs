import { useBlockProps } from '@wordpress/block-editor';
import Chart from './charts/Chart';
import { resolveTrackColor, resolveBlockGap, resolveMinHeight } from './track-color';

export default function save( { attributes } ) {
	const { items, showLegend } = attributes;
	const blockProps = useBlockProps.save();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );
	const chartHeight = resolveMinHeight( attributes );
	return (
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
	);
}
