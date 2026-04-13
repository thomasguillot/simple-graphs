import { useBlockProps, RichText, store as blockEditorStore } from '@wordpress/block-editor';
import { useRef, useState, useLayoutEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { contrastColor, parseNumeric, resolveColorValue } from '../shared/utils';
import { NEUTRAL_GRAY } from '../shared/constants';

export default function Edit( { attributes, setAttributes, context, clientId, isSelected } ) {
	const { value, title } = attributes;
	const numericValue = parseNumeric( value );

	// Figure out the effective background and a matching text color.
	// If nothing is set, fall back to a neutral gray with dark text so a new
	// data-item is visible immediately without the user having to pick a color.
	const presetBg = attributes.backgroundColor;
	const rawCustomBg = attributes.style?.color?.background;
	const customBg = resolveColorValue( rawCustomBg );
	const hasPresetBg = !! presetBg;
	const hasCustomBg = !! customBg;
	const isVarBg = hasCustomBg && customBg.startsWith( 'var(' );

	let barBg;
	let initialTextColor;
	if ( ! hasPresetBg && ! hasCustomBg ) {
		barBg = NEUTRAL_GRAY;
		initialTextColor = '#000';
	} else if ( hasPresetBg ) {
		barBg = `var(--wp--preset--color--${ presetBg })`;
		initialTextColor = '#fff';
	} else if ( isVarBg ) {
		barBg = customBg;
		initialTextColor = '#fff';
	} else {
		barBg = customBg;
		initialTextColor = contrastColor( customBg );
	}

	const barRef = useRef( null );
	const [ needsGrow, setNeedsGrow ] = useState( false );
	const [ resolvedTextColor, setResolvedTextColor ] = useState( initialTextColor );

	// For var() backgrounds (presets, tokens), read the computed colour
	// from the DOM and pick the right text contrast.
	useLayoutEffect( () => {
		if ( ! barRef.current || ( ! isVarBg && ! hasPresetBg ) ) {
			setResolvedTextColor( initialTextColor );
			return;
		}
		const computed = window.getComputedStyle( barRef.current ).backgroundColor;
		const match = computed.match( /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/ );
		if ( match ) {
			const hex = '#' +
				( '0' + parseInt( match[ 1 ] ).toString( 16 ) ).slice( -2 ) +
				( '0' + parseInt( match[ 2 ] ).toString( 16 ) ).slice( -2 ) +
				( '0' + parseInt( match[ 3 ] ).toString( 16 ) ).slice( -2 );
			setResolvedTextColor( contrastColor( hex ) );
		} else {
			setResolvedTextColor( initialTextColor );
		}
	}, [ barBg, initialTextColor, isVarBg, hasPresetBg ] );

	// User-set text colour takes priority over auto-contrast.
	const presetText = attributes.textColor;
	const customText = attributes.style?.color?.text;
	const userTextColor = presetText
		? `var(--wp--preset--color--${ presetText })`
		: ( customText ? resolveColorValue( customText ) : null );
	const textColor = userTextColor || resolvedTextColor;

	// useLayoutEffect fires after DOM update but before browser paint,
	// so the user never sees the intermediate state.
	useLayoutEffect( () => {
		if ( ! isSelected || ! barRef.current ) {
			setNeedsGrow( false );
			return;
		}
		const bar = barRef.current;
		const wrapper = bar.closest( '.wp-block-simple-graphs-data-item' );
		if ( ! wrapper ) {
			return;
		}
		const prevHeight = bar.style.height;
		bar.style.height = 'auto';
		const contentHeight = bar.offsetHeight;
		bar.style.height = prevHeight;
		setNeedsGrow( contentHeight > wrapper.offsetHeight );
	}, [ isSelected, value, title ] );

	const blockProps = useBlockProps( {
		style: {
			'--sg-value': numericValue,
			...( needsGrow ? { height: 'auto' } : {} ),
		},
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
				ref={ barRef }
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
