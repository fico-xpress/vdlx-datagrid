/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/utils.js
   ```````````````````````
   vdlx-datagrid utils.

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
import {COLUMN_SORTERS, EDITOR_TYPES, ROW_DATA_TYPES} from "../../constants";
import {chooseColumnFilter, Enums} from "../grid-filters";
import {convertArrayOfArraysData, convertPrimitiveArray, getRowDataType} from './custom-data-utils';
import {checkboxFilterFunc, FILTER_PLACEHOLDER_TEXT, getHeaderFilterParams} from '../column-filter-utils';
import assign from "lodash/assign";
import isNaN from "lodash/isNaN";
import isBoolean from "lodash/isBoolean";
import toNumber from "lodash/toNumber";
import filter from 'lodash/filter';
import isFunction from "lodash/isFunction";
import values from "lodash/values";
import parseInt from "lodash/parseInt";
import cloneDeep from "lodash/cloneDeep";

/**
 * creates config object containing data and columns
 * @param gridOptions
 * @returns {{data: (*|[]), columns: (*|*[])}}
 */
export const createCustomConfig = (gridOptions) => {

    const data = gridOptions.data();
    const freezeColumns = parseInt(gridOptions.freezeColumns);
    const includeFilter = gridOptions.columnFilter || false;
    const rowFilter = gridOptions.rowFilter;

    // formalise/convert table data
    let tableData = convertCustomData(data);

    // apply rowFilter from attr
    if (isFunction(rowFilter)) {
        tableData = applyRowFilter(tableData, rowFilter);
    }

    const rowOne = tableData[0];

    return {
        columns: rowOne ? createAutoColumnDefinitions(rowOne, includeFilter, freezeColumns) : [],
        data: tableData
    };
};

/**
 * ensures data in the correct array of objects format
 * @param data
 * @returns {*[]|*}
 */
export const convertCustomData = (data) => {
    // clone the gridOptions data so not updating original
    let customData = cloneDeep(data);

    switch (getRowDataType(customData[0])) {
        case ROW_DATA_TYPES.array:
            return convertArrayOfArraysData(customData);
        case ROW_DATA_TYPES.primitive:
            return convertPrimitiveArray(customData);
        case ROW_DATA_TYPES.object:
            return customData;
        default:
            console.error('Error for component vdlx-datagrid: Please remove functions from the data.');
            return [];
    }
};

/**
 * triger the rowFilter call back set in the attrs
 * @param data
 * @param rowFilter
 * @returns {*}
 */
export const applyRowFilter = (data, rowFilter) => {
    return filter(data, (rowData) => {
        return rowFilter(values(rowData));
    });
}

export const createAutoColumnDefinitions = (data, includeFilter, freezeColumns) => {
    // map over the object entries, so I can have key value and index
    return Object.entries(data).map(([key,val], index) => {
        return createColumnDefinition(val, key, includeFilter, index < freezeColumns)
    });
};

/**
 * create a column configuration
 * @param val
 * @param key
 * @param includeFilter
 * @param freeze
 * @returns {*}
 */
export const createColumnDefinition = (val, key, includeFilter, freeze) => {

    const requiredProps = {
        id: key,
        field: key,
        title: key,
        frozen: freeze
    };

    let col;
    if (isNaN(toNumber(val))) {
        // string column
        col = assign(requiredProps, {
            editor: EDITOR_TYPES.text,
            sorter: COLUMN_SORTERS.string,
            elementType: Enums.DataType.STRING
        });
    } else if (isBoolean(val)) {
        // boolean column with checkbox
        const checkboxFormatter = (cell) => {
            const checked = cell.getValue() ? 'checked' : '';
            const disabled = 'disabled';
            return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
        };
        col = assign(requiredProps, {
                editor: EDITOR_TYPES.checkbox,
                sorter: COLUMN_SORTERS.boolean,
                elementType: Enums.DataType.BOOLEAN,
                formatter: checkboxFormatter
            }
        );
    } else {
        // numeric column
        col = assign(requiredProps, {
            editor: EDITOR_TYPES.text,
            sorter: COLUMN_SORTERS.number,
            elementType: Enums.DataType.INTEGER,
            cssClass: 'numeric'
        });
    }

    if (includeFilter) {
        return configureColumnFilter(col);
    }
    return col;
};

/**
 * configure a column filter for a column
 * @returns {*}
 * @param col
 */
export const configureColumnFilter = (col) => {

    const getHeaderFilter = () => {
        if (col.editor === EDITOR_TYPES.checkbox) {
            return EDITOR_TYPES.select;
        }
        return true;
    };

    const getHeaderFilterFn = (column) => {

        if (column.editor === EDITOR_TYPES.checkbox) {
            return checkboxFilterFunc;
        }

        const columnFilter = chooseColumnFilter(column);
        if (columnFilter) {
            return (valueTxt, cellValue, rowData, params) => {
                return columnFilter(valueTxt, cellValue, rowData, params);
            };
        }
        return undefined;
    };

    let filterConfig = {
        headerFilterParams: getHeaderFilterParams(col),
        headerFilterPlaceholder: FILTER_PLACEHOLDER_TEXT,
        headerFilter: getHeaderFilter(),
        headerFilterFunc: getHeaderFilterFn(col)
    };
    return assign(col, filterConfig);
};
