/**
 * Extract typography-related styles from blockProps and return them separately,
 * so they can be applied to value labels instead of the block wrapper.
 */

const TYPOGRAPHY_STYLE_KEYS = [
	'fontFamily',
	'fontSize',
	'fontWeight',
	'fontStyle',
	'lineHeight',
	'letterSpacing',
	'textTransform',
	'textDecoration',
];

/**
 * Splits blockProps.style into typography styles and the rest.
 */
export function extractTypographyStyle( style = {} ) {
	const typography = {};
	const rest = {};
	for ( const [ key, value ] of Object.entries( style ) ) {
		if ( TYPOGRAPHY_STYLE_KEYS.includes( key ) ) {
			typography[ key ] = value;
		} else {
			rest[ key ] = value;
		}
	}
	return { typography, rest };
}

/**
 * Extract typography-related class names (has-*-font-size, has-*-font-family, etc.)
 * from a className string.
 */
export function extractTypographyClasses( className = '' ) {
	const classes = className.split( /\s+/ );
	const typographyClasses = [];
	const restClasses = [];
	for ( const cls of classes ) {
		if (
			cls.match( /has-.*-font-size/ ) ||
			cls.match( /has-.*-font-family/ )
		) {
			typographyClasses.push( cls );
		} else {
			restClasses.push( cls );
		}
	}
	return {
		typographyClassName: typographyClasses.join( ' ' ),
		restClassName: restClasses.join( ' ' ),
	};
}
