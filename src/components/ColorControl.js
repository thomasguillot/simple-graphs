import {
	ColorPalette,
	ColorPicker,
	Dropdown,
	Icon,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useMemo, useRef, useEffect, createPortal, useState } from '@wordpress/element';
import { useSetting } from '@wordpress/block-editor';
import { contrastColor } from '../charts/shared';

function flattenPalette( palette ) {
	if ( ! Array.isArray( palette ) || palette.length === 0 ) {
		return [];
	}
	if ( palette[ 0 ] && Array.isArray( palette[ 0 ].colors ) ) {
		return palette.flatMap( ( group ) => group.colors || [] );
	}
	return palette;
}

export default function ColorControl( { value, onChange } ) {
	const rawPalette = useSetting( 'color.palette' ) || [];
	const colors = useMemo(
		() => flattenPalette( rawPalette ),
		[ rawPalette ]
	);
	const isCustom = ! colors.some( ( c ) => c.color === value );
	const wrapperRef = useRef( null );
	const portalRef = useRef( null );
	const [ portalTarget, setPortalTarget ] = useState( null );

	useEffect( () => {
		if ( ! wrapperRef.current ) {
			return;
		}
		const swatches = wrapperRef.current.querySelector(
			'.components-circular-option-picker__swatches'
		);
		if ( ! swatches ) {
			return;
		}

		// Create a container for our custom swatch if it doesn't exist.
		if ( ! portalRef.current ) {
			portalRef.current = document.createElement( 'div' );
			portalRef.current.style.display = 'contents';
		}

		// Append to the end of the swatches row.
		if ( portalRef.current.parentNode !== swatches ) {
			swatches.appendChild( portalRef.current );
		}
		setPortalTarget( portalRef.current );
	} );

	const customSwatch = (
		<Dropdown
			popoverProps={ { placement: 'left-start', shift: true } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					onClick={ onToggle }
					aria-expanded={ isOpen }
					aria-label={ __( 'Custom color', 'simple-graphs' ) }
					title={ __( 'Custom color', 'simple-graphs' ) }
					style={ {
						position: 'relative',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 0,
						margin: 0,
						width: 28,
						height: 28,
						borderRadius: '50%',
						border: 'none',
						cursor: 'pointer',
						outline: 'none',
						background: isCustom
							? value
							: 'linear-gradient(-45deg, transparent 48%, #ddd 48%, #ddd 52%, transparent 52%) #fff',
						boxShadow:
							'inset 0 0 0 1px rgba(0, 0, 0, 0.2)',
					} }
				>
					{ isCustom && (
						<Icon
							icon={ check }
							size={ 24 }
							style={ { fill: contrastColor( value ) } }
						/>
					) }
				</button>
			) }
			renderContent={ () => (
				<ColorPicker
					color={ value }
					onChange={ onChange }
					enableAlpha={ false }
				/>
			) }
		/>
	);

	return (
		<div ref={ wrapperRef }>
			<ColorPalette
				colors={ colors }
				value={ value }
				onChange={ ( color ) => onChange( color || value ) }
				disableCustomColors
				clearable={ false }
				__experimentalIsRenderedInSidebar
			/>
			{ portalTarget && createPortal( customSwatch, portalTarget ) }
		</div>
	);
}
