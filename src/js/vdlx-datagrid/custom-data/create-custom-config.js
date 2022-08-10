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
import {COLUMN_SORTERS, ROW_DATA_TYPES} from "../../constants";
import {chooseColumnFilter, Enums} from "../grid-filters";
import {convertArrayOfArraysData, convertPrimitiveArray, getRowDataType} from '../utils';
import assign from "lodash/assign";
import map from "lodash/map";
import isNaN from "lodash/isNaN";
import isBoolean from "lodash/isBoolean";
import toNumber from "lodash/toNumber";

export const createCustomConfig = (data, includeFilter) => {
    const tableData = convertCustomData(data);
    return {
        columns: createAutoColumnDefinitions(tableData[0], includeFilter),
        data: tableData
    };
};

// data must be returned as an array of objects
export const convertCustomData = (data) => {
    switch (getRowDataType(data[0])) {
        case ROW_DATA_TYPES.array:
            return convertArrayOfArraysData(data);
        case ROW_DATA_TYPES.primitive:
            return convertPrimitiveArray(data);
        case ROW_DATA_TYPES.object:
            return data;
        default:
            console.error('Error for component vdlx-datagrid: Please remove functions from the data.');
            return [];
    }
};

export const createAutoColumnDefinitions = (data, includeFilter) => {
    return map(data, (val, key) => createColumnDefinition(val, key, includeFilter));
};

export const createColumnDefinition = (val, key, includeFilter) => {
    const requiredProps = {
        id: key,
        field: key,
        title: key
    };

    let col;
    if (isNaN(toNumber(val))) {
        // string column
        col = assign(requiredProps, {
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
            sorter: COLUMN_SORTERS.boolean,
            elementType: Enums.DataType.BOOLEAN,
            formatter: checkboxFormatter}
        );
    } else {
        // numeric column
        col = assign(requiredProps, {
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

export const configureColumnFilter = (col) => {
    const getCustomHeaderFilterFn = () => {
        const columnFilter = chooseColumnFilter(col);
        if (columnFilter) {
            return (valueTxt, cellValue, rowData, params) => {
                return columnFilter(valueTxt, cellValue, rowData, params);
            };
        }
        return undefined;
    };

    let filterConfig = {
        headerFilterPlaceholder: 'No filter',
        headerFilter: true,
        headerFilterFunc: getCustomHeaderFilterFn()
    };
    return assign(col, filterConfig);
};
