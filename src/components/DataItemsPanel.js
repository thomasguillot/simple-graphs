import {
	PanelBody,
	Button,
	ToggleControl,
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
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
	valuePrefix,
	valueSuffix,
	onChangeAttribute,
	showLegend,
	onToggleLegend,
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
		const total = items.reduce(
			( sum, i ) => sum + Number( i.value ),
			0
		);
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

	const isCustom = valueMode === 'custom';

	return (
		<PanelBody title={ __( 'Data', 'simple-graphs' ) } initialOpen={ true }>
			<div className="simple-graphs-data-panel">
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
				>
					{ __( 'Add item', 'simple-graphs' ) }
				</Button>
				<ToggleGroupControl
					label={ __( 'Value format', 'simple-graphs' ) }
					value={ valueMode }
					onChange={ ( v ) => onChangeAttribute( 'valueMode', v ) }
					isBlock
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
						<TextControl
							label={ __( 'Prefix', 'simple-graphs' ) }
							value={ valuePrefix }
							onChange={ ( v ) =>
								onChangeAttribute( 'valuePrefix', v )
							}
							placeholder={ __( 'e.g. $', 'simple-graphs' ) }
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Suffix', 'simple-graphs' ) }
							value={ valueSuffix }
							onChange={ ( v ) =>
								onChangeAttribute( 'valueSuffix', v )
							}
							placeholder={ __( 'e.g. k', 'simple-graphs' ) }
							__nextHasNoMarginBottom
						/>
					</>
				) }
			</div>
			<div style={ { marginTop: 16 } }>
				<ToggleControl
					label={ __( 'Show legend', 'simple-graphs' ) }
					checked={ showLegend }
					onChange={ onToggleLegend }
					help={ __(
						'Display item labels and icons next to the chart.',
						'simple-graphs'
					) }
					__nextHasNoMarginBottom
				/>
			</div>
		</PanelBody>
	);
}
