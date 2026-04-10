import { PanelBody, Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DataItemRow from './DataItemRow';
import { computeTotal } from '../charts/shared';

const MAX_ITEMS = 8;
// Vibrant palette, all AA-contrast (≥4.5:1) against white.
const DEFAULT_COLORS = [
	'#DB2777', // pink
	'#0891B2', // cyan
	'#7C3AED', // violet
	'#D97706', // amber
	'#059669', // emerald
	'#DC2626', // red
	'#2563EB', // blue
	'#C026D3', // fuchsia
];

function uid() {
	return Math.random().toString( 36 ).slice( 2, 10 );
}

export default function DataItemsPanel( { items, onChange } ) {
	const total = computeTotal( items );
	const overflow = total > 100;

	const updateItem = ( id, next ) => {
		onChange( items.map( ( i ) => ( i.id === id ? next : i ) ) );
	};

	const removeItem = ( id ) => {
		onChange( items.filter( ( i ) => i.id !== id ) );
	};

	const addItem = () => {
		if ( items.length >= MAX_ITEMS ) {
			return;
		}
		const remainder = 100 - total;
		const value = remainder > 0 ? Math.min( remainder, 100 ) : 10;
		onChange( [
			...items,
			{
				id: uid(),
				title: '',
				value,
				color: DEFAULT_COLORS[ items.length % DEFAULT_COLORS.length ],
				icon: null,
			},
		] );
	};

	const moveItem = ( index, direction ) => {
		const target = index + direction;
		if ( target < 0 || target >= items.length ) {
			return;
		}
		const next = [ ...items ];
		[ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
		onChange( next );
	};

	return (
		<PanelBody title={ __( 'Data', 'simple-graphs' ) } initialOpen={ true }>
			{ items.map( ( item, index ) => (
				<DataItemRow
					key={ item.id }
					item={ item }
					onChange={ ( next ) => updateItem( item.id, next ) }
					onRemove={ () => removeItem( item.id ) }
					onMoveUp={
						index > 0 ? () => moveItem( index, -1 ) : null
					}
					onMoveDown={
						index < items.length - 1
							? () => moveItem( index, 1 )
							: null
					}
				/>
			) ) }
			<Button
				variant="secondary"
				onClick={ addItem }
				disabled={ items.length >= MAX_ITEMS }
				style={ { marginTop: 8 } }
			>
				{ __( 'Add item', 'simple-graphs' ) }
			</Button>
			<div
				style={ {
					marginTop: 12,
					padding: 8,
					background: overflow ? '#FEF3C7' : '#F3F4F6',
					borderRadius: 4,
					fontSize: 12,
				} }
			>
				{ __( 'Total:', 'simple-graphs' ) } <strong>{ total }%</strong>
				{ overflow && (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'Total exceeds 100%.', 'simple-graphs' ) }
					</Notice>
				) }
			</div>
		</PanelBody>
	);
}
