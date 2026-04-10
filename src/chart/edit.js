import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const TEMPLATE = [
	[ 'simple-graphs/data-item', { value: '40', title: 'Item A', backgroundColor: '#DB2777' } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item B', backgroundColor: '#0891B2' } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item C', backgroundColor: '#7C3AED' } ],
	[ 'simple-graphs/legend', {} ],
];
const ALLOWED_BLOCKS = [ 'simple-graphs/data-item', 'simple-graphs/legend' ];

export default function Edit() {
	const blockProps = useBlockProps();
	return (
		<div { ...blockProps }>
			<InnerBlocks template={ TEMPLATE } allowedBlocks={ ALLOWED_BLOCKS } />
		</div>
	);
}
