import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToolbarGroup,
	ToolbarButton,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { pencil as editIcon, seen } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { parseNumeric, resolveBlockGap, isZeroGap, resolveRadius } from '../shared/utils';
import CircularChart from '../chart/CircularChart';

const TEMPLATE = [
	[ 'simple-graphs/data-item', { value: '40', title: 'Item A', style: { color: { background: '#DB2777' } } } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item B', style: { color: { background: '#0891B2' } } } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item C', style: { color: { background: '#7C3AED' } } } ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data-item' ];
const CIRCULAR_VARIATIONS = [ 'pie', 'donut', 'bubble' ];

function resolveVariation( className = '' ) {
	const match = className.match( /is-style-(column|bar|pie|donut|stacked|bubble)/ );
	return match ? match[ 1 ] : 'column';
}

export default function Edit( { clientId, attributes, setAttributes } ) {
	const { valueMode } = attributes;
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
							: '#F0F0F0' ),
				} ) );
		},
		[ clientId ]
	);

	const dataMax = Math.max( 1, ...items.map( ( i ) => parseNumeric( i.value ) ) );
	const sgMax = valueMode === 'percentage' ? Math.max( 100, dataMax ) : dataMax;

	const blockProps = useBlockProps( {
		className: noGap ? 'simple-graphs-data--no-gap' : undefined,
		style: {
			'--sg-max': sgMax,
			'--sg-gap': resolvedGap,
			'--sg-radius': radius,
			gap: resolvedGap,
		},
	} );

	const variation = resolveVariation( blockProps.className );
	const isCircular = CIRCULAR_VARIATIONS.includes( variation );
	const orientation =
		variation === 'bar' || variation === 'stacked' ? 'vertical' : 'horizontal';

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
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
