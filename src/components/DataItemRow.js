import {
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
	ColorPalette,
	ColorIndicator,
	Button,
	BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useId } from '@wordpress/element';

export default function DataItemRow( {
	item,
	onChange,
	onRemove,
	onMoveUp,
	onMoveDown,
	valueMode = 'percentage',
} ) {
	const [ expanded, setExpanded ] = useState( false );
	const colorId = useId();

	return (
		<div className="simple-graphs-item">
			<div
				className="simple-graphs-item__header"
				role="button"
				tabIndex={ 0 }
				aria-expanded={ expanded }
				onClick={ () => setExpanded( ! expanded ) }
				onKeyDown={ ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						e.preventDefault();
						setExpanded( ! expanded );
					}
				} }
			>
				<ColorIndicator colorValue={ item.color } />
				<span className="simple-graphs-item__title">
					{ item.title || __( 'Untitled', 'simple-graphs' ) }
				</span>
			</div>
			{ expanded && (
				<div className="simple-graphs-item__body">
					<TextControl
						label={ __( 'Title', 'simple-graphs' ) }
						value={ item.title }
						onChange={ ( title ) => onChange( { ...item, title } ) }
						__nextHasNoMarginBottom
					/>
					<NumberControl
						label={ __( 'Value', 'simple-graphs' ) }
						value={ item.value }
						onChange={ ( value ) =>
							onChange( {
								...item,
								value: valueMode === 'percentage'
									? Math.min( 100, Math.max( 0, Number( value ) || 0 ) )
									: Math.max( 0, Number( value ) || 0 ),
							} )
						}
						min={ 0 }
						max={ valueMode === 'percentage' ? 100 : undefined }
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
					<div className="simple-graphs-item__actions">
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
						<span className="simple-graphs-item__spacer" />
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
