import {
	PanelBody,
	Button,
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DataItemRow from './DataItemRow';

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

export default function DataItemsPanel( {
	items,
	onChange,
	valueMode,
	valueMax,
	valuePrefix,
	valueSuffix,
	onChangeAttribute,
	legendPosition,
} ) {
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
		let value = 10;
		if ( valueMode === 'percentage' ) {
			const total = items.reduce( ( sum, i ) => sum + Number( i.value ), 0 );
			const remainder = 100 - total;
			value = remainder > 0 ? Math.min( remainder, 100 ) : 10;
		}
		onChange( [
			...items,
			{
				id: uid(),
				title: '',
				value,
				color: DEFAULT_COLORS[ items.length % DEFAULT_COLORS.length ],
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

	const isCustom = valueMode === 'custom';

	return (
		<PanelBody title={ __( 'Data', 'simple-graphs' ) } initialOpen={ true }>
			<VStack spacing={ 2 } style={ { marginBottom: 16 } }>
				<div className="simple-graphs-items">
					{ items.map( ( item, index ) => (
						<DataItemRow
							key={ item.id }
							item={ item }
							valueMode={ valueMode }
							onChange={ ( next ) =>
								updateItem( item.id, next )
							}
							onRemove={ () => removeItem( item.id ) }
							onMoveUp={
								index > 0
									? () => moveItem( index, -1 )
									: null
							}
							onMoveDown={
								index < items.length - 1
									? () => moveItem( index, 1 )
									: null
							}
						/>
					) ) }
				</div>
				<Button
					variant="secondary"
					onClick={ addItem }
					disabled={ items.length >= MAX_ITEMS }
					style={ { width: '100%', justifyContent: 'center' } }
					size="compact"
				>
					{ __( 'Add item', 'simple-graphs' ) }
				</Button>
			</VStack>
			<ToggleGroupControl
				label={ __( 'Value format', 'simple-graphs' ) }
				value={ valueMode }
				onChange={ ( v ) => onChangeAttribute( 'valueMode', v ) }
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
							onChangeAttribute(
								'valueMax',
								Math.max( 0, Number( v ) || 0 )
							)
						}
						min={ 0 }
						step={ 1 }
						placeholder={ __( 'Auto', 'simple-graphs' ) }
						help={ __(
							'Reference maximum for sizing. Leave empty to auto-detect.',
							'simple-graphs'
						) }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ __( 'Prefix', 'simple-graphs' ) }
						value={ valuePrefix }
						onChange={ ( v ) =>
							onChangeAttribute( 'valuePrefix', v )
						}
						placeholder={ __( 'e.g. $', 'simple-graphs' ) }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ __( 'Suffix', 'simple-graphs' ) }
						value={ valueSuffix }
						onChange={ ( v ) =>
							onChangeAttribute( 'valueSuffix', v )
						}
						placeholder={ __( 'e.g. k', 'simple-graphs' ) }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</>
			) }
			<ToggleGroupControl
				label={ __( 'Legend', 'simple-graphs' ) }
				value={ legendPosition }
				onChange={ ( v ) => onChangeAttribute( 'legendPosition', v ) }
				isBlock
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			>
				<ToggleGroupControlOption
					value="side"
					label={ __( 'Side', 'simple-graphs' ) }
				/>
				<ToggleGroupControlOption
					value="below"
					label={ __( 'Below', 'simple-graphs' ) }
				/>
				<ToggleGroupControlOption
					value="none"
					label={ __( 'None', 'simple-graphs' ) }
				/>
			</ToggleGroupControl>
		</PanelBody>
	);
}
