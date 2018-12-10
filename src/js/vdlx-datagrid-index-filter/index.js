import IndexFilterAttributes from './attributes';
import transform from './transform';
import viewModel from './view-model';

VDL('vdlx-datagrid-index-filter', {
    tag: 'vdlx-datagrid-index-filter',
    attributes: IndexFilterAttributes,
    createViewModel: viewModel,
    transform: transform,
    // Apply errors to the parent vdlx-datagrid
    errorTargetSelector: function (element) {
        return $(element).closest('vdlx-datagrid')[0] || element;
    },
    requiredParent: ['vdlx-datagrid'],
});

