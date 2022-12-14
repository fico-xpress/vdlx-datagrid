/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/custom-data/create-custom-config.js

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
import {CUSTOM_COLUMN_DEFINITION, EDITOR_TYPES} from "../../constants";
import {chooseColumnFilter} from "../grid-filters";
import {
    validatePivotRowsAndColumns,
    convertObjectColDefinitions,
    createBasicColumnDefinition,
    pivotColumnSizeToIndex,
    pivotRowSizeToIndex,
    validateLabelsData,
    validateObjectColDefinitions
} from './custom-column-utils';
import {
    castToArray,
    convertCustomDataToObjectData,
    convertObjectDataToLabelData,
    createLabelsConfig
} from './custom-data-utils';
import {
    checkboxFilterFunc,
    FILTER_PLACEHOLDER_TEXT,
    getHeaderFilterEmptyCheckFn,
    getHeaderFilterParams
} from '../column-filter-utils';
import {createPivotConfig} from './create-pivot-config';
import assign from "lodash/assign";
import filter from 'lodash/filter';
import isFunction from "lodash/isFunction";
import values from "lodash/values";
import parseInt from "lodash/parseInt";
import size from "lodash/size";
import map from "lodash/map";
import head from "lodash/head";
import isUndefined from "lodash/isUndefined";

/**
 * creates config object containing data and columns
 * @param gridOptions
 * @returns {{data: (*|[]), columns: (*|*[])}}
 */
export const createCustomConfig = (gridOptions) => {
    const data = gridOptions.data();

    if (!size(data)) {
        return {
            columns: [],
            data: []
        };
    }

    let datagridData = [];
    let columnDefinitions = [];

    switch (gridOptions.columnDefinitionType) {
        case CUSTOM_COLUMN_DEFINITION.AUTO:
            datagridData = convertCustomDataToObjectData(data);
            columnDefinitions = createAutoDefinitionColumns(head(datagridData));
            break
        case CUSTOM_COLUMN_DEFINITION.OBJECT:
            datagridData = data;
            columnDefinitions = createObjectDefinitionColumns(gridOptions.columnDefinitions(), head(data));
            break
        case CUSTOM_COLUMN_DEFINITION.LABELS:
            datagridData = createLabelData(data);
            columnDefinitions = createLabelsDefinitionColumns(data);
            break
        case CUSTOM_COLUMN_DEFINITION.PIVOT:

            // take the first row of the data and count the dimensions
            const dimensionality = data[0].key ? data[0].key.length : 0;

            let rows;
            // pivotRowPositions and pivotRowCount are mutually exclusive
            if (gridOptions.pivotRowPositions) {
                rows = castToArray(gridOptions.pivotRowPositions)
            } else {
                rows = pivotRowSizeToIndex(dimensionality, gridOptions.pivotRowCount);
            }

            let columns;
            // pivotColumnPositions and pivotColCount are mutually exclusive
            if (gridOptions.pivotColumnPositions) {
                columns = castToArray(gridOptions.pivotColumnPositions)
            } else {
                columns = pivotColumnSizeToIndex(dimensionality, gridOptions.pivotColCount);
            }

            validatePivotRowsAndColumns(rows, columns, dimensionality);

            const pivotConfig = {
                rows: rows,
                cols: columns,
                aggregationType: 'sum',
                includeTotals: true
            };

            const labelConfig = createLabelsConfig(gridOptions.pivotLabels);
            if (size(labelConfig)) {
                pivotConfig.labels = labelConfig;
            }

            const pivotHeaders = gridOptions.pivotHeaders;
            if (size(labelConfig)) {
                pivotConfig.header = pivotHeaders;
            }

            const pivotData = createPivotConfig(data, pivotConfig);
            datagridData = pivotData.data;
            columnDefinitions = pivotData.cols;
            break
        default:
            throw Error('Error for component vdlx-datagrid: Unrecognised column format.');
    }
    // apply rowFilter from attr
    const rowFilter = gridOptions.rowFilter;
    if (isFunction(rowFilter)) {
        datagridData = applyRowFilter(datagridData, rowFilter);
    }

    // addGridOptionsProps will add column features set from vdlx-datagrid attributes
    return {
        columns: addGridOptionsProps(gridOptions, columnDefinitions),
        data: datagridData
    };

};

/**
 * trigger the rowFilter call back set in the attrs
 * @param data
 * @param rowFilter
 * @returns {*}
 */
export const applyRowFilter = (data, rowFilter) => {
    return filter(data, (rowData) => {
        return rowFilter(values(rowData));
    });
}
/**
 * create the column definitions from a row of data
 * @param data
 * @returns {*}
 */
export const createAutoDefinitionColumns = (data) => {
    return map(data, (val, key) => createBasicColumnDefinition(key, val));
};

/**
 * validate and convert an array of objects containing a value and label
 * @param data
 * @returns {undefined[]}
 */
export const createLabelData = (data) => {
    // error thrown for invalid data
    if (validateLabelsData(data)) {
        return convertObjectDataToLabelData(data);
    }
}

/**
 * take the user defined column configurations and add the required value type attributes, and delete undesired props
 * if present, the ID will be overwritten, this is to make it work with grid-filters.filter(...)
 * @param colDefinitions
 * @param data
 * @returns {*}
 */
export const createObjectDefinitionColumns = (colDefinitions, data) => {
    // error thrown if validation fails
    if (validateObjectColDefinitions(colDefinitions, data)) {
        return convertObjectColDefinitions(colDefinitions, data)
    }
}

export const createLabelsDefinitionColumns = (data) => {
    return map(data, (row, index) => createBasicColumnDefinition(index, row.value, row.label));
};

/**
 * add all properties set via the vdlx-datagrid attributes
 * this will not overwrite properties directly set on the column
 * @param gridOptions
 * @param columns
 * @returns {*}
 */
export const addGridOptionsProps = (gridOptions, columns) => {

    const freezeColumns = parseInt(gridOptions.freezeColumns);
    const includeFilter = gridOptions.columnFilter || false;

    return map(columns, (col, index) => {
        let gridCol = {};
        if (isUndefined(col.frozen) && index < freezeColumns) {
            gridCol.frozen = true;
        }
        if (includeFilter) {
            assign(gridCol, configureColumnFilter(col));
        }
        return {
            ...col,
            ...gridCol
        };
    });
};


/**
 * configure a column filter for a column
 * existing column filter attrs will not be overwritten
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

    const headerFilterParams = col.headerFilterParams || getHeaderFilterParams(col);
    const headerFilterEmptyCheck = col.headerFilterEmptyCheck || getHeaderFilterEmptyCheckFn(col, headerFilterParams);

    let filterConfig = {
        headerFilterParams: headerFilterParams,
        headerFilterPlaceholder: col.headerFilterPlaceholder || FILTER_PLACEHOLDER_TEXT,
        headerFilter: isUndefined(col.headerFilter) ? getHeaderFilter() : col.headerFilter,
        headerFilterFunc: col.headerFilterFunc || getHeaderFilterFn(col),
        headerFilterEmptyCheck: headerFilterEmptyCheck,
    };
    return assign(col, filterConfig);
};
