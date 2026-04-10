/**
 * Resolve the track color (background shown behind each item's bar) from the
 * block's native color support attributes.
 *
 * Returns a CSS color string, or null if no background is set.
 */
/**
 * Resolve the block gap from the block's spacing attributes.
 * Handles both preset slugs ("var:preset|spacing|30") and raw values ("16px").
 */
export function resolveBlockGap( attributes ) {
	return attributes?.blockGap || 'var(--wp--preset--spacing--30, 1rem)';
}

export function resolveMinHeight( attributes ) {
	return attributes?.style?.dimensions?.minHeight || '480px';
}

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
