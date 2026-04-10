import { registerBlockType } from '@wordpress/blocks';
import { chartBar } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

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
} );

registerBlockType( dataItemMetadata.name, {
	edit: dataItemEdit,
	save: dataItemSave,
} );

registerBlockType( legendMetadata.name, {
	edit: legendEdit,
	save: legendSave,
} );
