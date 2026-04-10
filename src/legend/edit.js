import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

export default function Edit( { clientId } ) {
	const blockProps = useBlockProps();

	const items = useSelect(
		( select ) => {
			const { getBlockParents, getBlock } = select( blockEditorStore );
			const parents = getBlockParents( clientId );
			const chartId = parents[ parents.length - 1 ];
			if ( ! chartId ) {
				return [];
			}
			const chartBlock = getBlock( chartId );
			if ( ! chartBlock ) {
				return [];
			}
			return chartBlock.innerBlocks
				.filter( ( b ) => b.name === 'simple-graphs/data-item' )
				.map( ( b ) => ( {
					clientId: b.clientId,
					title: b.attributes.title || '',
					color:
						b.attributes.style?.color?.background ||
						b.attributes.backgroundColor ||
						'#ccc',
				} ) );
		},
		[ clientId ]
	);

	return (
		<div { ...blockProps }>
			{ items.map( ( item ) => (
				<div key={ item.clientId } className="simple-graphs-legend__item">
					<span
						className="simple-graphs-legend__swatch"
						style={ { background: item.color } }
					/>
					<span className="simple-graphs-legend__label">
						{ item.title || 'Untitled' }
					</span>
				</div>
			) ) }
		</div>
	);
}
