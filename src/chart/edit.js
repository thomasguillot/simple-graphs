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
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { edit as editIcon, seen } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { isZeroGap } from '../shared/utils';
import CircularChart from './CircularChart';

const TEMPLATE = [
	[ 'simple-graphs/data-item', { value: '40', title: 'Item A', style: { color: { background: '#DB2777' } } } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item B', style: { color: { background: '#0891B2' } } } ],
	[ 'simple-graphs/data-item', { value: '30', title: 'Item C', style: { color: { background: '#7C3AED' } } } ],
	[ 'simple-graphs/legend', {} ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data-item', 'simple-graphs/legend' ];
const CIRCULAR_VARIATIONS = [ 'pie', 'donut', 'bubble' ];

function resolveVariation( className = '' ) {
	const match = className.match( /is-style-(column|bar|pie|donut|stacked|bubble)/ );
	return match ? match[ 1 ] : 'column';
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { valueMode, valuePrefix, valueSuffix, valueMax } = attributes;
	const blockProps = useBlockProps();
	const variation = resolveVariation( blockProps.className );
	const isCustom = valueMode === 'custom';
	const isCircular = CIRCULAR_VARIATIONS.includes( variation );
	const [ editMode, setEditMode ] = useState( false );
	const blockGap = attributes.style?.spacing?.blockGap;
	const noGap = isZeroGap( blockGap );
	const itemsClassName = noGap
		? 'simple-graphs-chart__items simple-graphs-chart__items--no-gap'
		: 'simple-graphs-chart__items';

	const innerBlocksProps = useInnerBlocksProps(
		{ className: itemsClassName },
		{
			template: TEMPLATE,
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: variation === 'bar' ? 'vertical' : 'horizontal',
		}
	);

	// Collect data-items for SVG rendering.
	const items = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const chartBlock = getBlock( clientId );
			if ( ! chartBlock ) {
				return [];
			}
			return chartBlock.innerBlocks
				.filter( ( b ) => b.name === 'simple-graphs/data-item' )
				.map( ( b ) => ( {
					clientId: b.clientId,
					value: b.attributes.value || '0',
					title: b.attributes.title || '',
					color:
						b.attributes.style?.color?.background ||
						( b.attributes.backgroundColor
							? `var(--wp--preset--color--${ b.attributes.backgroundColor })`
							: '#ccc' ),
				} ) );
		},
		[ clientId ]
	);

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
					{ isCustom && (
						<>
							<NumberControl
								label={ __( 'Max value', 'simple-graphs' ) }
								value={ valueMax || '' }
								onChange={ ( v ) =>
									setAttributes( { valueMax: Math.max( 0, Number( v ) || 0 ) } )
								}
								min={ 0 }
								step={ 1 }
								placeholder={ __( 'Auto', 'simple-graphs' ) }
								help={ __( 'Reference maximum for sizing. Leave empty to auto-detect.', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Prefix', 'simple-graphs' ) }
								value={ valuePrefix }
								onChange={ ( v ) => setAttributes( { valuePrefix: v } ) }
								placeholder={ __( 'e.g. $', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Suffix', 'simple-graphs' ) }
								value={ valueSuffix }
								onChange={ ( v ) => setAttributes( { valueSuffix: v } ) }
								placeholder={ __( 'e.g. k', 'simple-graphs' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ isCircular && ! editMode ? (
					<>
						<CircularChart variation={ variation } items={ items } />
						<div style={ { display: 'none' } }>
							<div { ...innerBlocksProps } />
						</div>
					</>
				) : (
					<div { ...innerBlocksProps } />
				) }
			</div>
		</>
	);
}
