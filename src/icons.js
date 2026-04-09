import * as wpIcons from '@wordpress/icons';

// Expose every icon exported from @wordpress/icons. The module also exports
// a default `Icon` component and a few non-icon helpers; filter those out.
const EXCLUDE = new Set( [ 'default', 'Icon', 'blockDefault' ] );

export const ICONS = Object.fromEntries(
	Object.entries( wpIcons ).filter(
		( [ key, value ] ) =>
			! EXCLUDE.has( key ) &&
			value &&
			( typeof value === 'object' || typeof value === 'function' )
	)
);

export const ICON_KEYS = Object.keys( ICONS ).sort();

export function getIcon( iconKey ) {
	return iconKey && ICONS[ iconKey ] ? ICONS[ iconKey ] : null;
}
