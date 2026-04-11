import { useBlockProps, RichText, store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { contrastColor, parseNumeric } from '../shared/utils';
import { NEUTRAL_GRAY } from '../shared/constants';

export default function Edit( { attributes, setAttributes, context, clientId } ) {
	const { value, title } = attributes;
	const numericValue = parseNumeric( value );

	// Figure out the effective background and a matching text color.
	// If nothing is set, fall back to a neutral gray with dark text so a new
	// data-item is visible immediately without the user having to pick a color.
	const presetBg = attributes.backgroundColor;
	const customBg = attributes.style?.color?.background;
	const hasPresetBg = !! presetBg;
	const hasCustomBg = !! customBg;
	const isVarBg =
		hasCustomBg &&
		( customBg.startsWith( 'var' ) || customBg.startsWith( 'var:' ) );

	let textColor;
	const extraStyle = { '--sg-value': numericValue };
	if ( ! hasPresetBg && ! hasCustomBg ) {
		extraStyle.backgroundColor = NEUTRAL_GRAY;
		textColor = '#000';
	} else if ( hasPresetBg || isVarBg ) {
		textColor = '#fff';
	} else {
		textColor = contrastColor( customBg );
	}

	const blockProps = useBlockProps( {
		style: extraStyle,
	} );
	const valueMode = context[ 'simple-graphs/valueMode' ] || 'percentage';
	const valuePrefix = context[ 'simple-graphs/valuePrefix' ] || '';
	const valueSuffix = context[ 'simple-graphs/valueSuffix' ] || '';

	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const { dataClientId, hasLegend } = useSelect(
		( select ) => {
			const { getBlockParents, getBlock } = select( blockEditorStore );
			const parents = getBlockParents( clientId );
			const chartId = parents[ 0 ] || null;
			const dataId = parents[ parents.length - 1 ] || null;
			if ( ! chartId ) {
				return { dataClientId: dataId, hasLegend: false };
			}
			const chartBlock = getBlock( chartId );
			const legendPresent = !! chartBlock?.innerBlocks?.some(
				( b ) => b.name === 'simple-graphs/legend'
			);
			return { dataClientId: dataId, hasLegend: legendPresent };
		},
		[ clientId ]
	);

	const updateParentAttr = ( key, val ) => {
		if ( dataClientId ) {
			updateBlockAttributes( dataClientId, { [ key ]: val } );
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
			{ ! hasLegend && (
				<RichText
					tagName="span"
					className="simple-graphs-data-item__title"
					value={ title }
					onChange={ ( v ) => setAttributes( { title: v } ) }
					allowedFormats={ [] }
					placeholder="Label"
				/>
			) }
		</div>
	);
}
