/**
 * Resolve the track color (background shown behind each item's bar) from the
 * block's native color support attributes.
 *
 * Returns a CSS color string, or null if no background is set.
 */
export function resolveTrackColor( attributes ) {
	const custom = attributes?.style?.color?.background;
	if ( custom ) {
		return custom;
	}
	const slug = attributes?.backgroundColor;
	if ( slug ) {
		return `var(--wp--preset--color--${ slug })`;
	}
	return null;
}
