import { useBlockProps } from '@wordpress/block-editor';

export default function Edit( { attributes } ) {
	const blockProps = useBlockProps();
	return <div { ...blockProps }>{ attributes.value }</div>;
}
