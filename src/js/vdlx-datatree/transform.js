/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-pivotgrid/transform.js
   ```````````````````````
   vdlx-datagrid transform function for VDL extension.

    (c) Copyright 2023 Fair Isaac Corporation

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

    let paramsBuilder = api.getComponentParamsBuilder(element);
    const data = attributes['data'];
    if (data) {
        paramsBuilder.addFunctionOrExpressionParam('data', data.expression.value, ['value']);
    }

    const schemaData = attributes['schema-data'];
    if (schemaData) {
        paramsBuilder.addFunctionOrExpressionParam('data', schemaData.expression.value, ['value']);
        paramsBuilder.addParam('columnDefinitionType', CUSTOM_COLUMN_DEFINITION.SCHEMA, false);
        paramsBuilder.addParam('enableDataTree', true);
        paramsBuilder.addParam('dataTreeChildField', "_children");
        paramsBuilder.addParam('dataTreeStartExpanded', true);
    }

    const pageSize = attributes['page-size'];
    if (pageSize) {
        if (pageSize.expression.isString) {
            const pageSizeNum = parseInt(pageSize.rawValue);
            if (!isNaN(pageSizeNum)) {
                paramsBuilder.addParam('pageSize', pageSizeNum);
            }
        } else {
            paramsBuilder.addParam('pageSize', pageSize.expression.value, true);
        }
    }

    const pageMode = attributes['page-mode'];
    if (pageMode && pageMode.rawValue === 'paged') {
        paramsBuilder.addParam('pageMode', pageMode.rawValue);
    } else {
        paramsBuilder.addParam('pageMode', 'scrolling');
        element.classList.add('scrolling');
    }

    const columnFilter = attributes['column-filter'];
    if (columnFilter) {
        paramsBuilder.addParam('columnFilter', columnFilter.rawValue.toUpperCase() === 'TRUE');
    }

    const tableIdAttr = attributes['id'];
    if (tableIdAttr) {
        element.setAttribute('id', '');
        paramsBuilder.addParam('tableId', tableIdAttr.rawValue);
    }

    const width = attributes['width'];
    if (width) {
        paramsBuilder.addParam('width', width.rawValue);
    }

    const klass = attributes['class'];
    if (klass) {
        element.removeAttribute('class');
        paramsBuilder.addParam('class', klass.rawValue);
    }

    const alwaysShowSelection = attributes['always-show-selection'];
    if (alwaysShowSelection && alwaysShowSelection.rawValue.toUpperCase() === 'TRUE') {
        paramsBuilder.addParam('alwaysShowSelection', true);
    }

    const rowFilter = attributes['row-filter'];
    if (rowFilter) {
        if (rowFilter.expression.isString) {
            throw Error('Error for component vdlx-pivotgrid: "row-filter" attribute must be supplied as an expression');
        }

        paramsBuilder.addFunctionOrExpressionParam('rowFilter', rowFilter.expression.value, ['rowData', 'indices']);
    }

    const gridHeight = attributes['height'];
    if (gridHeight) {
        if (gridHeight.expression.isString) {
            paramsBuilder.addParam('gridHeight', gridHeight.rawValue, false);
        } else {
            paramsBuilder.addParam('gridHeight', gridHeight.expression.value, true);
        }
    }

    const showExport = attributes['show-export'];
    if (showExport) {
        if (showExport.expression.isString) {
            paramsBuilder.addParam('showExport', showExport.rawValue.toUpperCase() === 'TRUE', false);
        } else {
            paramsBuilder.addParam('showExport', showExport.expression.value, true);
        }
    }

    const exportFilename = attributes['export-filename'];
    if (exportFilename) {
        if (exportFilename.expression.isString) {
            paramsBuilder.addParam('exportFilename', exportFilename.rawValue, false);
        } else {
            paramsBuilder.addParam('exportFilename', exportFilename.expression.value, true);
        }
    }

    var dataTreeStartExpanded = attributes['data-tree-start-expanded'];
    if(dataTreeStartExpanded){
        if(!schemaData){
            new Error("Error for component vdlx-datagrid: When using the data-tree-start-expanded attribute, enable-data-tree must be provided via the data attribute.'")
        }
        if (dataTreeStartExpanded.rawValue.toUpperCase() === 'TRUE') {
            paramsBuilder.addParam('dataTreeStartExpanded', true);
        }
        else{
            paramsBuilder.addParam('dataTreeStartExpanded', false);
        }
    }

}
