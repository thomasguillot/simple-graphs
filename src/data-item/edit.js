import { useBlockProps, RichText, store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { contrastColor, parseNumeric } from '../shared/utils';
import { NEUTRAL_GRAY } from '../shared/constants';

export default function Edit( { attributes, setAttributes, context, clientId, isSelected } ) {
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
	let barBg;
	if ( ! hasPresetBg && ! hasCustomBg ) {
		barBg = NEUTRAL_GRAY;
		textColor = '#000';
	} else if ( hasPresetBg ) {
		barBg = `var(--wp--preset--color--${ presetBg })`;
		textColor = '#fff';
	} else if ( isVarBg ) {
		barBg = customBg;
		textColor = '#fff';
	} else {
		barBg = customBg;
		textColor = contrastColor( customBg );
	}

	const blockProps = useBlockProps( {
		className: isSelected ? 'is-editing' : undefined,
		style: { '--sg-value': numericValue },
	} );
	const valueMode = context[ 'simple-graphs/valueMode' ] || 'percentage';
	const valuePrefix = context[ 'simple-graphs/valuePrefix' ] || '';
	const valueSuffix = context[ 'simple-graphs/valueSuffix' ] || '';

	const hasLegend = useSelect(
		( select ) => {
			const { getBlockParentsByBlockName, getBlock } = select( blockEditorStore );
			const [ chartId ] = getBlockParentsByBlockName(
				clientId,
				'simple-graphs/chart'
			);
			if ( ! chartId ) {
				return false;
			}
			const chartBlock = getBlock( chartId );
			return !! chartBlock?.innerBlocks?.some(
				( b ) => b.name === 'simple-graphs/legend'
			);
		},
		[ clientId ]
	);

	return (
		<div { ...blockProps }>
			<div
				className="simple-graphs-data-item__bar"
				style={ {
					backgroundColor: barBg,
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
				{ ! hasLegend && (
					<RichText
						tagName="span"
						className="simple-graphs-data-item__title"
						value={ title }
						onChange={ ( v ) => setAttributes( { title: v } ) }
						allowedFormats={ [] }
						placeholder={ __( 'Label', 'simple-graphs' ) }
					/>
				) }
			</div>
		</div>
	);
}
