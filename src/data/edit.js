import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { pencil as editIcon, seen } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { parseNumeric, resolveBlockGap, isZeroGap, resolveRadius } from '../shared/utils';
import { NEUTRAL_GRAY } from '../shared/constants';
import CircularChart from '../chart/CircularChart';

const DEFAULT_BG = [
	`var(--wp--preset--color--accent, ${ NEUTRAL_GRAY })`,
	`var(--wp--preset--color--accent-2, ${ NEUTRAL_GRAY })`,
	`var(--wp--preset--color--accent-3, ${ NEUTRAL_GRAY })`,
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data-item' ];
const CIRCULAR_VARIATIONS = [ 'pie', 'donut', 'bubble' ];

function resolveVariation( className = '' ) {
	const match = className.match( /is-style-(column|bar|pie|donut|stacked|bubble)/ );
	return match ? match[ 1 ] : 'column';
}

export default function Edit( { clientId, attributes, setAttributes } ) {
	const { valueMode, valuePrefix, valueSuffix, compensateGap } = attributes;
	const blockGap = attributes.style?.spacing?.blockGap;
	const resolvedGap = resolveBlockGap( blockGap );
	const noGap = isZeroGap( blockGap );
	const radius = resolveRadius( attributes.style?.border?.radius );
	const [ editMode, setEditMode ] = useState( false );

	const items = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const self = getBlock( clientId );
			if ( ! self ) {
				return [];
			}
			return self.innerBlocks
				.filter( ( b ) => b.name === 'simple-graphs/data-item' )
				.map( ( b ) => ( {
					clientId: b.clientId,
					value: b.attributes.value || '0',
					title: b.attributes.title || '',
					color:
						b.attributes.style?.color?.background ||
						( b.attributes.backgroundColor
							? `var(--wp--preset--color--${ b.attributes.backgroundColor })`
							: NEUTRAL_GRAY ),
				} ) );
		},
		[ clientId ]
	);

	const dataMax = Math.max( 1, ...items.map( ( i ) => parseNumeric( i.value ) ) );
	const sgMax = valueMode === 'percentage' ? Math.max( 100, dataMax ) : dataMax;

	const rawTrackColor = attributes.style?.color?.background;
	const trackColor =
		( rawTrackColor
			? ( rawTrackColor.startsWith( 'var:preset|color|' )
				? `var(--wp--preset--color--${ rawTrackColor.replace( 'var:preset|color|', '' ) })`
				: rawTrackColor )
			: null ) ||
		( attributes.backgroundColor
			? `var(--wp--preset--color--${ attributes.backgroundColor })`
			: null );

	const variation = resolveVariation( attributes.className );
	const isCircular = CIRCULAR_VARIATIONS.includes( variation );
	const isStacked = variation === 'stacked';

	const classNames = [
		noGap ? 'simple-graphs-data--no-gap' : '',
		trackColor && ! isStacked ? 'simple-graphs-data--has-track' : '',
		compensateGap ? 'simple-graphs-data--compensate-gap' : '',
	].filter( Boolean ).join( ' ' ) || undefined;

	const blockProps = useBlockProps( {
		className: classNames,
		style: {
			'--sg-max': sgMax,
			'--sg-gap': resolvedGap,
			'--sg-radius': radius,
			'--sg-track': trackColor || undefined,
			gap: resolvedGap,
		},
	} );
	const orientation =
		variation === 'bar' || variation === 'stacked' ? 'vertical' : 'horizontal';

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const template = useMemo( () => [
		[ 'simple-graphs/data-item', { value: '40', title: __( 'Item A', 'simple-graphs' ), style: { color: { background: DEFAULT_BG[ 0 ] } } } ],
		[ 'simple-graphs/data-item', { value: '30', title: __( 'Item B', 'simple-graphs' ), style: { color: { background: DEFAULT_BG[ 1 ] } } } ],
		[ 'simple-graphs/data-item', { value: '30', title: __( 'Item C', 'simple-graphs' ), style: { color: { background: DEFAULT_BG[ 2 ] } } } ],
	], [] );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template,
		allowedBlocks: ALLOWED_BLOCKS,
		orientation,
		defaultBlock: { name: 'simple-graphs/data-item' },
		directInsert: true,
	} );

	return (
		<>
			{ isCircular && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon={ editMode ? seen : editIcon }
							label={
								editMode
									? __( 'Preview', 'simple-graphs' )
									: __( 'Edit data', 'simple-graphs' )
							}
							onClick={ () => setEditMode( ! editMode ) }
							isPressed={ editMode }
						/>
					</ToolbarGroup>
				</BlockControls>
			) }
			<InspectorControls>
				<PanelBody title={ __( 'Values', 'simple-graphs' ) }>
					<ToggleGroupControl
						label={ __( 'Value format', 'simple-graphs' ) }
						help={ __( 'Percentage appends %. Custom lets you set a prefix and suffix.', 'simple-graphs' ) }
						value={ valueMode }
						onChange={ ( v ) => setAttributes( { valueMode: v } ) }
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="percentage"
							label={ __( 'Percentage', 'simple-graphs' ) }
						/>
						<ToggleGroupControlOption
							value="custom"
							label={ __( 'Custom', 'simple-graphs' ) }
						/>
					</ToggleGroupControl>
					{ valueMode === 'custom' && (
						<>
							<TextControl
								label={ __( 'Prefix', 'simple-graphs' ) }
								help={ __( 'Text before the value, e.g. $ or "Revenue: ". Spaces are preserved.', 'simple-graphs' ) }
								value={ valuePrefix }
								onChange={ ( v ) => setAttributes( { valuePrefix: v } ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Suffix', 'simple-graphs' ) }
								help={ __( 'Text after the value, e.g. k, % or " units". Spaces are preserved.', 'simple-graphs' ) }
								value={ valueSuffix }
								onChange={ ( v ) => setAttributes( { valueSuffix: v } ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</>
					) }
					<ToggleGroupControl
						label={ __( 'Bar sizing', 'simple-graphs' ) }
						help={ __( 'Adjusted shrinks bars to account for the spacing between them.', 'simple-graphs' ) }
						value={ compensateGap ? 'adjusted' : 'full' }
						onChange={ ( v ) => setAttributes( { compensateGap: v === 'adjusted' } ) }
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="full"
							label={ __( 'Full', 'simple-graphs' ) }
						/>
						<ToggleGroupControlOption
							value="adjusted"
							label={ __( 'Adjusted', 'simple-graphs' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			{ isCircular && ! editMode ? (
				<div { ...blockProps }>
					<CircularChart variation={ variation } items={ items } />
					<div style={ { display: 'none' } }>
						<div { ...innerBlocksProps } />
					</div>
				</div>
			) : (
				<div { ...innerBlocksProps } />
			) }
		</>
	);
}
