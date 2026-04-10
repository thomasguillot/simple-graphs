import { useBlockProps, RichText } from '@wordpress/block-editor';
import { contrastColor } from '../shared/utils';

export default function Edit( { attributes, setAttributes, context } ) {
	const { value, title } = attributes;
	const blockProps = useBlockProps();
	// Resolve background color for contrast calculation.
	let bgColor = attributes.style?.color?.background || '#DB2777';
	// If it's a CSS var or preset token, we can't compute contrast — default to white text.
	if ( bgColor.startsWith( 'var' ) || bgColor.startsWith( 'var:' ) ) {
		bgColor = '#000'; // Force white text for preset colors (dark assumed)
	}
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
