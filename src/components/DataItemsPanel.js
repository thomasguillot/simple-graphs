import { PanelBody, Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DataItemRow from './DataItemRow';
import { computeTotal } from '../charts/shared';

const MAX_ITEMS = 8;
const DEFAULT_COLORS = [ '#1E40AF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316' ];

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
		onChange( [
			...items,
			{
				id: uid(),
				title: __( 'New item', 'simple-graphs' ),
				value: 10,
				color: DEFAULT_COLORS[ items.length % DEFAULT_COLORS.length ],
				icon: null,
			},
		] );
	};

	return (
		<PanelBody title={ __( 'Data', 'simple-graphs' ) } initialOpen={ true }>
			{ items.map( ( item ) => (
				<DataItemRow
					key={ item.id }
					item={ item }
					onChange={ ( next ) => updateItem( item.id, next ) }
					onRemove={ () => removeItem( item.id ) }
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
