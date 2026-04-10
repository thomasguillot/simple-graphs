import { useBlockProps, RichText } from '@wordpress/block-editor';
import { contrastColor } from '../shared/utils';

export default function Edit( { attributes, setAttributes, context } ) {
	const { value, title } = attributes;
	const blockProps = useBlockProps();
	const bgColor = blockProps.style?.backgroundColor || '#DB2777';
	const textColor = contrastColor( bgColor );
	const valueMode = context[ 'simple-graphs/valueMode' ] || 'percentage';
	const valuePrefix = context[ 'simple-graphs/valuePrefix' ] || '';
	const valueSuffix = context[ 'simple-graphs/valueSuffix' ] || '';

	return (
		<div
			{ ...blockProps }
			style={ {
				...blockProps.style,
				color: textColor,
			} }
		>
			<div className="simple-graphs-data-item__value">
				{ valueMode === 'custom' && valuePrefix && (
					<span className="simple-graphs-data-item__affix">{ valuePrefix }</span>
				) }
				<RichText
					tagName="span"
					value={ value }
					onChange={ ( v ) => setAttributes( { value: v } ) }
					allowedFormats={ [] }
					placeholder="0"
				/>
				{ valueMode === 'percentage' && (
					<span className="simple-graphs-data-item__affix">%</span>
				) }
				{ valueMode === 'custom' && valueSuffix && (
					<span className="simple-graphs-data-item__affix">{ valueSuffix }</span>
				) }
			</div>
			<RichText
				tagName="span"
				className="simple-graphs-data-item__title"
				value={ title }
				onChange={ ( v ) => setAttributes( { title: v } ) }
				allowedFormats={ [] }
				placeholder="Label"
			/>
		</div>
	);
}
