/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/transform.js
   ```````````````````````
   vdlx-datagrid transform function for VDL extension.

    (c) Copyright 2019 Fair Isaac Corporation

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


import {CUSTOM_COLUMN_DEFINITION} from "../constants";

import {ko} from "../insight-modules";

/**
 * The transform function takes care of setting up/initialising a VDL extension.
 * @param {HTMLElement} element - The VDL DOM node.
 * @param attributes - A map of attributes by key.
 * @param api - Helper methods for VDL extension creation.
 */
export default function transform(element, attributes, api) {
    var paramsBuilder = api.getComponentParamsBuilder(element);
    var $element = $(element);

    var data = attributes['data'];
    if (data) {
        paramsBuilder.addFunctionOrExpressionParam('data', data.expression.value, ['value']);
    }

    // hardcoded to pivot
    paramsBuilder.addParam('columnDefinitionType', CUSTOM_COLUMN_DEFINITION.PIVOT, false);

    const pivotRowPositions = attributes['row-set-position'];
    if (pivotRowPositions) {
        if (pivotRowPositions.expression.isString) {
            paramsBuilder.addParam('pivotRowPositions', pivotRowPositions.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotRowPositions', pivotRowPositions.expression.value, true);
        }
    }
    const pivotRowDimensions = attributes['row-dimensions'];
    if (pivotRowDimensions) {
        if (pivotRowDimensions.expression.isString) {
            paramsBuilder.addParam('pivotRowDimensions', pivotRowDimensions.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotRowDimensions', pivotRowDimensions.expression.value, true);
        }
    }
    const pivotRowTitles = attributes['row-titles'];
    if (pivotRowTitles) {
        if (pivotRowTitles.expression.isString) {
            paramsBuilder.addParam('pivotRowTitles', pivotRowTitles.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotRowTitles', pivotRowTitles.expression.value, true);
        }
    }

    // todo this should validate that if pivotRowPositions && pivotRowDimensions both exist, that pivotRowDimensions is an array of strings
    // if (pivotRowPositions && pivotRowDimensions) {
    //     throw Error('Error for component vdlx-pivotgrid: "row-set-position" and "row-count" are mutually exclusive.');
    // }

    const pivotColumnPositions = attributes['column-set-position'];
    if (pivotColumnPositions) {
        if (pivotColumnPositions.expression.isString) {
            paramsBuilder.addParam('pivotColumnPositions', pivotColumnPositions.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotColumnPositions', pivotColumnPositions.expression.value, true);
        }
    }
    const pivotColumnDimensions = attributes['column-dimensions'];
    if (pivotColumnDimensions) {
        if (pivotColumnDimensions.expression.isString) {
            paramsBuilder.addParam('pivotColumnDimensions', pivotColumnDimensions.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotColumnDimensions', pivotColumnDimensions.expression.value, true);
        }
    }
    const pivotColumnTitles = attributes['column-titles'];
    if (pivotColumnTitles) {
        if (pivotColumnTitles.expression.isString) {
            paramsBuilder.addParam('pivotColumnTitles', pivotColumnTitles.rawValue, false);
        } else {
            paramsBuilder.addParam('pivotColumnTitles', pivotColumnTitles.expression.value, true);
        }
    }

    // todo this should validate that if pivotRowPositions && pivotRowDimensions both exist, that pivotRowDimensions is an array of strings
    // if (pivotColumnPositions && pivotColumnDimensions) {
    //     throw Error('Error for component vdlx-pivotgrid: "column-count" and "column-count" are mutually exclusive.');
    // }

    var pageSize = attributes['page-size'];
    if (pageSize) {
        if (pageSize.expression.isString) {
            var pageSizeNum = parseInt(pageSize.rawValue);
            if (!isNaN(pageSizeNum)) {
                paramsBuilder.addParam('pageSize', pageSizeNum);
            }
        } else {
            paramsBuilder.addParam('pageSize', pageSize.expression.value, true);
        }
    }

    var pageMode = attributes['page-mode'];
    if (pageMode && pageMode.rawValue === 'paged') {
        paramsBuilder.addParam('pageMode', pageMode.rawValue);
    } else {
        paramsBuilder.addParam('pageMode', 'scrolling');
        $(element).addClass('scrolling');
    }

    var columnFilter = attributes['column-filter'];
    if (columnFilter) {
        paramsBuilder.addParam('columnFilter', columnFilter.rawValue.toUpperCase() === 'TRUE');
    }

    var tableIdAttr = attributes['id'];
    if (tableIdAttr) {
        $element.attr('id', null);
        paramsBuilder.addParam('tableId', tableIdAttr.rawValue);
    }

    var width = attributes['width'];
    if (width) {
        paramsBuilder.addParam('width', width.rawValue);
    }

    var klass = attributes['class'];
    if (klass) {
        $element.removeAttr('class');
        paramsBuilder.addParam('class', klass.rawValue);
    }

    var alwaysShowSelection = attributes['always-show-selection'];
    if (alwaysShowSelection && alwaysShowSelection.rawValue.toUpperCase() === 'TRUE') {
        paramsBuilder.addParam('alwaysShowSelection', true);
    }

    var rowFilter = attributes['row-filter'];
    if (rowFilter) {
        if (rowFilter.expression.isString) {
            throw Error('The vdl-table "row-filter" attribute must be supplied as an expression');
        }

        paramsBuilder.addFunctionOrExpressionParam('rowFilter', rowFilter.expression.value, ['rowData', 'indices']);
    }

    var gridHeight = attributes['height'];
    if (gridHeight) {
        if (gridHeight.expression.isString) {
            paramsBuilder.addParam('gridHeight', gridHeight.rawValue, false);
        } else {
            paramsBuilder.addParam('gridHeight', gridHeight.expression.value, true);
        }
    }

    var showExport = attributes['show-export'];
    if (showExport) {
        if (showExport.expression.isString) {
            paramsBuilder.addParam('showExport', showExport.rawValue.toUpperCase() === 'TRUE', false);
        } else {
            paramsBuilder.addParam('showExport', showExport.expression.value, true);
        }
    }

    var exportFilename = attributes['export-filename'];
    if (exportFilename) {
        if (exportFilename.expression.isString) {
            paramsBuilder.addParam('exportFilename', exportFilename.rawValue, false);
        } else {
            paramsBuilder.addParam('exportFilename', exportFilename.expression.value, true);
        }
    }

}
