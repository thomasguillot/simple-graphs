import { registerBlockType } from '@wordpress/blocks';
import { SVG, Path } from '@wordpress/primitives';
import { chartBar, category, caption } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import './style.scss';
import './editor.scss';

import dataMetadata from '../data/block.json';
import dataEdit from '../data/edit';
import dataSave from '../data/save';
import '../data/style.scss';

import dataItemMetadata from '../data-item/block.json';
import dataItemEdit from '../data-item/edit';
import dataItemSave from '../data-item/save';
import '../data-item/style.scss';

import legendMetadata from '../legend/block.json';
import legendEdit from '../legend/edit';
import legendSave from '../legend/save';
import '../legend/style.scss';

// Empty-frame icon: the @wordpress/icons `video` frame without the play triangle.
const dataItemIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M18.7 3H5.3C4 3 3 4 3 5.3v13.4C3 20 4 21 5.3 21h13.4c1.3 0 2.3-1 2.3-2.3V5.3C21 4 20 3 18.7 3zm.8 15.7c0 .4-.4.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V5.3c0-.4.4-.8.8-.8h13.4c.4 0 .8.4.8.8v13.4z" />
	</SVG>
);

registerBlockType( metadata.name, {
	icon: chartBar,
	edit: Edit,
	save,
	deprecated,
} );

registerBlockType( dataMetadata.name, {
	icon: category,
	edit: dataEdit,
	save: dataSave,
} );

registerBlockType( dataItemMetadata.name, {
	icon: dataItemIcon,
	edit: dataItemEdit,
	save: dataItemSave,
} );

registerBlockType( legendMetadata.name, {
	icon: caption,
	edit: legendEdit,
	save: legendSave,
} );
