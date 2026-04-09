import { useState } from '@wordpress/element';
import {
	Button,
	Popover,
	TextControl,
	Icon as IconComponent,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ICONS, ICON_KEYS, getIcon } from '../icons';

export default function IconPicker( { value, onChange } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ query, setQuery ] = useState( '' );

	const filtered = ICON_KEYS.filter( ( k ) =>
		k.toLowerCase().includes( query.toLowerCase() )
	);
	const current = getIcon( value );

	return (
		<div className="simple-graphs-icon-picker">
			<Button
				variant="secondary"
				onClick={ () => setIsOpen( ! isOpen ) }
				aria-label={ __( 'Choose icon', 'simple-graphs' ) }
			>
				{ current ? (
					<IconComponent icon={ current } size={ 20 } />
				) : (
					__( 'No icon', 'simple-graphs' )
				) }
			</Button>
			{ isOpen && (
				<Popover onClose={ () => setIsOpen( false ) } placement="bottom-start">
					<div style={ { padding: 12, width: 260 } }>
						<TextControl
							value={ query }
							onChange={ setQuery }
							placeholder={ __( 'Search icons', 'simple-graphs' ) }
							__nextHasNoMarginBottom
						/>
						<div
							style={ {
								display: 'grid',
								gridTemplateColumns: 'repeat(6, 1fr)',
								gap: 4,
								marginTop: 8,
								maxHeight: 220,
								overflowY: 'auto',
							} }
						>
							<Button
								variant={ value === null ? 'primary' : 'tertiary' }
								onClick={ () => {
									onChange( null );
									setIsOpen( false );
								} }
								style={ { fontSize: 10, height: 32 } }
							>
								—
							</Button>
							{ filtered.map( ( key ) => (
								<Button
									key={ key }
									variant={ value === key ? 'primary' : 'tertiary' }
									onClick={ () => {
										onChange( key );
										setIsOpen( false );
									} }
									style={ { height: 32, padding: 0 } }
									aria-label={ key }
								>
									<IconComponent icon={ ICONS[ key ] } size={ 18 } />
								</Button>
							) ) }
						</div>
					</div>
				</Popover>
			) }
		</div>
	);
}
