import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return (
		<div { ...useBlockProps.save() }>
			<div className="simple-graphs-chart__items">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
