import { useBlockProps, RichText, store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { contrastColor } from '../shared/utils';

export default function Edit( { attributes, setAttributes, context, clientId } ) {
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

	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const chartClientId = useSelect(
		( select ) => {
			const parents = select( blockEditorStore ).getBlockParents( clientId );
			return parents[ parents.length - 1 ] || null;
		},
		[ clientId ]
	);

	const updateParentAttr = ( key, val ) => {
		if ( chartClientId ) {
			updateBlockAttributes( chartClientId, { [ key ]: val } );
		}
	};

	return (
		<div
			{ ...blockProps }
			style={ {
				...blockProps.style,
				color: textColor,
			} }
		>
			<div className="simple-graphs-data-item__value">
				{ valueMode === 'custom' && (
					<RichText
						tagName="span"
						className="simple-graphs-data-item__affix"
						value={ valuePrefix }
						onChange={ ( v ) => updateParentAttr( 'valuePrefix', v ) }
						allowedFormats={ [] }
						placeholder="$"
					/>
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
				{ valueMode === 'custom' && (
					<RichText
						tagName="span"
						className="simple-graphs-data-item__affix"
						value={ valueSuffix }
						onChange={ ( v ) => updateParentAttr( 'valueSuffix', v ) }
						allowedFormats={ [] }
						placeholder="k"
					/>
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
