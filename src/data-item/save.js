import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { value, title } = attributes;
	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName="span"
				className="simple-graphs-data-item__value"
				value={ value }
			/>
			{ title && (
				<RichText.Content
					tagName="span"
					className="simple-graphs-data-item__title"
					value={ title }
				/>
			) }
		</div>
	);
}
