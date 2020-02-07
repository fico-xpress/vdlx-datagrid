import isPlainObject from 'lodash/isPlainObject';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import bindKey from 'lodash/bindKey';
import isUndefined from 'lodash/isUndefined';
import pickBy from 'lodash/pickBy';
import flow from 'lodash/flow';
import negate from 'lodash/negate';
import identity from 'lodash/identity';
import isNull from 'lodash/isNull';
import overSome from 'lodash-es/overSome';

const DEFAULT_GRID_PAGE_SIZE = 50;

const stripEmpties = obj => pickBy(obj, flow(identity, negate(isNullOrUndefined)));

const isNullOrUndefined = overSome([isNull, isUndefined]);

export default params => {
    var overrides = stripEmpties({
        searching: params.showFilter,
        columnFilter: params.columnFilter
    });
    var gridOptions = {
        tableId: params.tableId,
        addRemoveRow: params.addRemoveRow,
        selectionAndNavigation: params.selectionNavigation,
        overrides: overrides,
        columnFilter: params.columnFilter,
        onError: bindKey(self, '_wrapAlert'),
        alwaysShowSelection: params.alwaysShowSelection,
        gridHeight: params.gridHeight,
        gridData: params.gridData,
        paginationSize: params.pageSize || DEFAULT_GRID_PAGE_SIZE,
        saveState: get(params, 'saveState', true),
        pageMode: params.pageMode,
        freezeColumns: params.freezeColumns,
        showExport: params.showExport,
        exportFilename: params.exportFilename
    };
    var pageMode = params['pageMode'];
    if (pageMode === 'paged') {
        gridOptions.pagination = 'local';
        gridOptions.paginationElement = $('.hidden-footer-toolbar').get(0); // hide the built-in paginator
    } else if (!pageMode || pageMode === 'none') {
    }
    if (isFunction(params.rowFilter)) {
        gridOptions.rowFilter = params.rowFilter;
    }
    gridOptions = stripEmpties(gridOptions);
    if (!isUndefined(params.modifier)) {
        if (isFunction(params.modifier)) {
            // Pass cloned options so they cannot modify the original table options object
            var modifiedTableOptions = params.modifier(cloneDeep(gridOptions));
            if (isPlainObject(modifiedTableOptions)) {
                gridOptions = modifiedTableOptions;
            }
        } else {
            // console.error('vdl-table (' + self.tableId + '): "modifier" attribute must be a function.');
        }
    }
    return gridOptions;
};
