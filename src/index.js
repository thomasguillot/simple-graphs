import { registerBlockType, registerBlockStyle } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, { edit, save } );

[
	{ name: 'column', label: __( 'Column', 'simple-graphs' ), isDefault: true },
	{ name: 'bar', label: __( 'Bar', 'simple-graphs' ) },
	{ name: 'pie', label: __( 'Pie', 'simple-graphs' ) },
	{ name: 'donut', label: __( 'Donut', 'simple-graphs' ) },
	{ name: 'stacked', label: __( 'Stacked', 'simple-graphs' ) },
	{ name: 'bubble', label: __( 'Bubble', 'simple-graphs' ) },
].forEach( ( style ) => registerBlockStyle( metadata.name, style ) );
