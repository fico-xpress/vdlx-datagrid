/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/create-table-options.js
   ```````````````````````
   vdlx-datagrid create-table-options.js

    (c) Copyright 2022 Fair Isaac Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import bindKey from 'lodash/bindKey';
import isUndefined from 'lodash/isUndefined';
import pickBy from 'lodash/pickBy';
import flow from 'lodash/flow';
import negate from 'lodash/negate';
import identity from 'lodash/identity';
import isNull from 'lodash/isNull';
import overSome from 'lodash/overSome';
import isArray from "lodash/isArray";

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
        paginationSize: params.pageSize || DEFAULT_GRID_PAGE_SIZE,
        saveState: get(params, 'saveState', true),
        pageMode: params.pageMode,
        freezeColumns: params.freezeColumns,
        showExport: params.showExport,
        exportFilename: params.exportFilename,
        data: params.data,
        columnDefinitionType: params.columnDefinitionType,
        columnDefinitions: params.columnDefinitions || [],

        // pivot attrs
        pivotRowPositions: params.pivotRowPositions,
        pivotRowDimensions: params.pivotRowDimensions,
        pivotRowTitles: params.pivotRowTitles,
        displayPivotRowCalc: params.displayPivotRowCalc,
        pivotColumnPositions: params.pivotColumnPositions,
        pivotColumnDimensions: params.pivotColumnDimensions,
        pivotColumnTitles: params.pivotColumnTitles,
        displayPivotColumnCalc: params.displayPivotColumnCalc
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
    return gridOptions;
};
