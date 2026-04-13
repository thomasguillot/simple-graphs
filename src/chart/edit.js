import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { caption } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { resolveBlockGap } from '../shared/utils';

const TEMPLATE = [
	[ 'simple-graphs/data', { lock: { move: true, remove: true } } ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data', 'simple-graphs/legend' ];

export default function Edit( { attributes, clientId } ) {
	const blockGap = attributes.style?.spacing?.blockGap;
	const resolvedGap = resolveBlockGap( blockGap );
	const { insertBlock, removeBlock } = useDispatch( blockEditorStore );

	const { legendClientId, dataRadius } = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const chartBlock = getBlock( clientId );
			if ( ! chartBlock ) {
				return { legendClientId: null, dataRadius: '6px' };
			}
			const legend = chartBlock.innerBlocks.find(
				( b ) => b.name === 'simple-graphs/legend'
			);
			const data = chartBlock.innerBlocks.find(
				( b ) => b.name === 'simple-graphs/data'
			);
			const rawRadius = data?.attributes?.style?.border?.radius ?? '6px';
			let radius;
			if ( typeof rawRadius === 'object' ) {
				radius = rawRadius.topLeft || rawRadius.topRight || rawRadius.bottomRight || rawRadius.bottomLeft || '6px';
			} else {
				radius = typeof rawRadius === 'number' ? `${ rawRadius }px` : rawRadius;
			}
			return {
				legendClientId: legend ? legend.clientId : null,
				dataRadius: radius,
			};
		},
		[ clientId ]
	);
	const hasLegend = !! legendClientId;

	const blockProps = useBlockProps( {
		style: { gap: resolvedGap, '--sg-radius': dataRadius },
	} );

	const toggleLegend = () => {
		if ( hasLegend ) {
			removeBlock( legendClientId, false );
			return;
		}
		const legend = createBlock( 'simple-graphs/legend' );
		insertBlock( legend, undefined, clientId, false );
	};

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		allowedBlocks: ALLOWED_BLOCKS,
		templateLock: false,
	} );

	return (
		<>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ caption }
						label={ __( 'Legend', 'simple-graphs' ) }
						onClick={ toggleLegend }
						isPressed={ hasLegend }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
