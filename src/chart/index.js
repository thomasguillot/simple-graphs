import { registerBlockType } from '@wordpress/blocks';
import { chartBar, category, homeButton, caption } from '@wordpress/icons';

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
	icon: homeButton,
	edit: dataItemEdit,
	save: dataItemSave,
} );

registerBlockType( legendMetadata.name, {
	icon: caption,
	edit: legendEdit,
	save: legendSave,
} );
