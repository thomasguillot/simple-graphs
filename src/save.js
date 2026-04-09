import { useBlockProps } from '@wordpress/block-editor';
import Chart from './charts/Chart';

export default function save( { attributes } ) {
	const { items } = attributes;
	const blockProps = useBlockProps.save();
	return (
		<div { ...blockProps }>
			<Chart items={ items } className={ blockProps.className } />
		</div>
	);
}
