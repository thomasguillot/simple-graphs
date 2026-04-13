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
import { resolveBlockGap, resolveRadius } from '../shared/utils';

const TEMPLATE = [
	[ 'simple-graphs/data', { lock: { move: true, remove: true } } ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data', 'simple-graphs/legend' ];

export default function Edit( { attributes, clientId } ) {
	const blockGap = attributes.style?.spacing?.blockGap || 'var:preset|spacing|50';
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
			return {
				legendClientId: legend ? legend.clientId : null,
				dataRadius: resolveRadius( data?.attributes?.style?.border?.radius ),
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
		allowedBlocks: hasLegend
			? ALLOWED_BLOCKS.filter( ( b ) => b !== 'simple-graphs/legend' )
			: ALLOWED_BLOCKS,
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
