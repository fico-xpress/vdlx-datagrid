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

        if ($element.has( 'vdlx-datagrid-column').length) {
            throw Error('vdlx-datagrid-column is not supported when using the data attribute.');
        }
    }

    var scenarioId = attributes['scenario'];
    if (scenarioId) {
        if (scenarioId.expression.isString) {
            var parsedNum = parseInt(scenarioId.rawValue);
            if (isNaN(parsedNum)) {
                paramsBuilder.addParam('scenarioId', scenarioId.rawValue);
            } else {
                if (parsedNum < 0) {
                    throw Error('If scenario-id is specifying an index it must be a positive integer.');
                }
                paramsBuilder.addParam('scenarioId', parsedNum);
            }
        } else {
            paramsBuilder.addParam('scenarioId', scenarioId.expression.value, true);
        }
        if (data) {
            throw Error('scenario is not supported when using the data attribute.');
        }
    }

    var pageSize = attributes['page-size'];
    if (pageSize) {
        var pageSizeNum = parseInt(pageSize.rawValue);
        if (!isNaN(pageSizeNum)) {
            paramsBuilder.addParam('pageSize', pageSizeNum);
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

    var addRemoveRow = attributes['add-remove-row'];
    if (addRemoveRow) {
        if (addRemoveRow.rawValue.toUpperCase() === 'TRUE') {
            paramsBuilder.addParam('addRemoveRow', true);
        } else if (addRemoveRow.rawValue === 'addrow-autoinc') {
            paramsBuilder.addParam('addRemoveRow', 'addrow-autoinc');
        }
        if (data) {
            throw Error('add-remove-row is not supported when using the data attribute.');
        }
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

    var saveState = attributes['save-state'];
    if (saveState && saveState.rawValue === 'false') {
        paramsBuilder.addParam('saveState', false);
    }

    var freezeColumns = attributes['freeze-columns'];
    if (freezeColumns) {
        paramsBuilder.addParam('freezeColumns', freezeColumns.rawValue);
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
            throw Error('The vdlx-datagrid "row-filter" attribute must be supplied as an expression');
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

    var columnDefinition = attributes['column-definition'];
    if (columnDefinition) {
        if (!data) {
            throw Error('Error for component vdlx-datagrid: When using the column-definition attribute, data must be ' +
                'provided via the data attribute.');
        }
        if (columnDefinition.expression.isString) {
            const defType = _.toLower(columnDefinition.rawValue);
            if (!_.includes(_.map(CUSTOM_COLUMN_DEFINITION), defType)) {
                throw Error('Error for component vdlx-datagrid: ' + defType + ' is not a recognised column definition.  ' +
                    'Allowed values are "auto", "labels" or a valid column definition object.');
            } else {
                paramsBuilder.addParam('columnDefinitionType', defType, false);
            }
        } else {
            paramsBuilder.addParam('columnDefinitionType', CUSTOM_COLUMN_DEFINITION.OBJECT, false);
            paramsBuilder.addFunctionOrExpressionParam('columnDefinitions', columnDefinition.expression.value, false);
        }
    } else {
        if (data) {
            paramsBuilder.addParam('columnDefinitionType', CUSTOM_COLUMN_DEFINITION.AUTO, false);
        }
    }

}
