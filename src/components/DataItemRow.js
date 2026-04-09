import {
	TextControl,
	__experimentalNumberControl as NumberControl,
	ColorPalette,
	Button,
	BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import IconPicker from './IconPicker';

export default function DataItemRow( { item, onChange, onRemove } ) {
	const [ expanded, setExpanded ] = useState( false );

	return (
		<div
			style={ {
				border: '1px solid #ddd',
				borderRadius: 4,
				marginBottom: 8,
				padding: 8,
			} }
		>
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					cursor: 'pointer',
				} }
				onClick={ () => setExpanded( ! expanded ) }
			>
				<span
					style={ {
						display: 'inline-block',
						width: 16,
						height: 16,
						borderRadius: 3,
						background: item.color,
						flexShrink: 0,
					} }
				/>
				<span style={ { flex: 1, fontSize: 12 } }>
					{ item.title || __( 'Untitled', 'simple-graphs' ) }
				</span>
				<span style={ { fontSize: 12, fontWeight: 600 } }>{ item.value }%</span>
			</div>
			{ expanded && (
				<div style={ { marginTop: 12 } }>
					<TextControl
						label={ __( 'Title', 'simple-graphs' ) }
						value={ item.title }
						onChange={ ( title ) => onChange( { ...item, title } ) }
						__nextHasNoMarginBottom
					/>
					<NumberControl
						label={ __( 'Value (%)', 'simple-graphs' ) }
						value={ item.value }
						onChange={ ( value ) =>
							onChange( { ...item, value: Math.max( 0, Math.min( 100, Number( value ) || 0 ) ) } )
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
					/>
					<BaseControl label={ __( 'Color', 'simple-graphs' ) } __nextHasNoMarginBottom>
						<ColorPalette
							value={ item.color }
							onChange={ ( color ) => onChange( { ...item, color: color || item.color } ) }
							clearable={ false }
						/>
					</BaseControl>
					<BaseControl label={ __( 'Icon', 'simple-graphs' ) } __nextHasNoMarginBottom>
						<IconPicker
							value={ item.icon }
							onChange={ ( icon ) => onChange( { ...item, icon } ) }
						/>
					</BaseControl>
					<Button
						variant="link"
						isDestructive
						onClick={ onRemove }
						style={ { marginTop: 8 } }
					>
						{ __( 'Remove item', 'simple-graphs' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
