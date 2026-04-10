import {
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
	ColorPalette,
	Button,
	BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useId } from '@wordpress/element';
import IconPicker from './IconPicker';

export default function DataItemRow( {
	item,
	onChange,
	onRemove,
	onMoveUp,
	onMoveDown,
} ) {
	const [ expanded, setExpanded ] = useState( false );
	const colorId = useId();
	const iconId = useId();

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
				role="button"
				tabIndex={ 0 }
				aria-expanded={ expanded }
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					cursor: 'pointer',
				} }
				onClick={ () => setExpanded( ! expanded ) }
				onKeyDown={ ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						e.preventDefault();
						setExpanded( ! expanded );
					}
				} }
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
				<span style={ { fontSize: 12, fontWeight: 600 } }>
					{ item.value }%
				</span>
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
							onChange( {
								...item,
								value: Math.max(
									0,
									Math.min( 100, Number( value ) || 0 )
								),
							} )
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
					/>
					<BaseControl
						id={ colorId }
						label={ __( 'Color', 'simple-graphs' ) }
						__nextHasNoMarginBottom
					>
						<ColorPalette
							value={ item.color }
							onChange={ ( color ) =>
								onChange( {
									...item,
									color: color || item.color,
								} )
							}
							clearable={ false }
						/>
					</BaseControl>
					<BaseControl
						id={ iconId }
						label={ __( 'Icon', 'simple-graphs' ) }
						__nextHasNoMarginBottom
					>
						<IconPicker
							value={ item.icon }
							onChange={ ( icon ) =>
								onChange( { ...item, icon } )
							}
						/>
					</BaseControl>
					<div
						style={ {
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							marginTop: 8,
						} }
					>
						<Button
							icon="arrow-up-alt2"
							label={ __( 'Move up', 'simple-graphs' ) }
							onClick={ onMoveUp }
							disabled={ ! onMoveUp }
							size="small"
						/>
						<Button
							icon="arrow-down-alt2"
							label={ __( 'Move down', 'simple-graphs' ) }
							onClick={ onMoveDown }
							disabled={ ! onMoveDown }
							size="small"
						/>
						<span style={ { flex: 1 } } />
						<Button
							variant="link"
							isDestructive
							onClick={ onRemove }
						>
							{ __( 'Remove', 'simple-graphs' ) }
						</Button>
					</div>
				</div>
			) }
		</div>
	);
}
