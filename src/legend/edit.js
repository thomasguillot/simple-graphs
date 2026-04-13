import {
	useBlockProps,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { resolveBlockGap, resolveColorValue } from '../shared/utils';
import { NEUTRAL_GRAY } from '../shared/constants';

export default function Edit( { attributes, clientId } ) {
	const resolvedGap = resolveBlockGap( attributes.style?.spacing?.blockGap );
	const blockProps = useBlockProps( {
		style: { gap: resolvedGap },
	} );
	const { updateBlockAttributes } = useDispatch( blockEditorStore );

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
			const dataBlock = chartBlock.innerBlocks.find(
				( b ) => b.name === 'simple-graphs/data'
			);
			if ( ! dataBlock ) {
				return [];
			}
			return dataBlock.innerBlocks
				.filter( ( b ) => b.name === 'simple-graphs/data-item' )
				.map( ( b ) => ( {
					clientId: b.clientId,
					title: b.attributes.title || '',
					color:
						resolveColorValue( b.attributes.style?.color?.background ) ||
						( b.attributes.backgroundColor
							? `var(--wp--preset--color--${ b.attributes.backgroundColor })`
							: NEUTRAL_GRAY ),
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
					<RichText
						tagName="span"
						className="simple-graphs-legend__label"
						value={ item.title }
						onChange={ ( v ) =>
							updateBlockAttributes( item.clientId, { title: v } )
						}
						allowedFormats={ [] }
						placeholder={ __( 'Label', 'simple-graphs' ) }
					/>
				</div>
			) ) }
		</div>
	);
}
