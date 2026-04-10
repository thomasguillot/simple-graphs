import { registerBlockType } from '@wordpress/blocks';
import { chartBar } from '@wordpress/icons';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: chartBar,
	edit,
	save,
	deprecated: [
		{
			attributes: {
				...metadata.attributes,
				showLegend: { type: 'boolean', default: true },
			},
			isEligible( attributes ) {
				return attributes.showLegend !== undefined;
			},
			migrate( attributes ) {
				const { showLegend, ...rest } = attributes;
				return {
					...rest,
					legendPosition: showLegend === false ? 'none' : 'side',
				};
			},
			save: () => null,
		},
	],
} );
