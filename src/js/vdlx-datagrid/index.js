
import VXDAttributes from './attributes';
import transform from './transform';
import viewModel from './view-model';

VDL('vdlx-datagrid', {
    tag: 'vdlx-datagrid',
    attributes: VXDAttributes,
    createViewModel: viewModel,
    transform: transform,
    modifiesDescendants: false,
});
