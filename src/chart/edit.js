import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { lineDashed } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { resolveBlockGap } from '../shared/utils';

const TEMPLATE = [
	[ 'simple-graphs/data', { lock: { move: true, remove: true } } ],
];

const ALLOWED_BLOCKS = [ 'simple-graphs/data', 'simple-graphs/legend' ];

export default function Edit( { attributes, clientId } ) {
	const blockGap = attributes.style?.spacing?.blockGap;
	const resolvedGap = resolveBlockGap( blockGap );
	const blockProps = useBlockProps( {
		style: { gap: resolvedGap },
	} );
	const { insertBlock, removeBlock } = useDispatch( blockEditorStore );

	const legendClientId = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const chartBlock = getBlock( clientId );
			if ( ! chartBlock ) {
				return null;
			}
			const legend = chartBlock.innerBlocks.find(
				( b ) => b.name === 'simple-graphs/legend'
			);
			return legend ? legend.clientId : null;
		},
		[ clientId ]
	);
	const hasLegend = !! legendClientId;

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
						icon={ lineDashed }
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
