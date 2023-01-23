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
    calculatePivotDisplayCalcs,
    convertObjectColDefinitions,
    createBasicColumnDefinition,
    extractLabels,
    pivotColumnSizeToIndex,
    pivotRowSizeToIndex,
    validateDimensions,
    validateLabelsData,
    validateObjectColDefinitions,
    validatePivotRowsAndColumns,
    validateSetPosition
} from './custom-column-utils';
import {convertCustomDataToObjectData, convertObjectDataToLabelData, createLabelsConfig} from './custom-data-utils';
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
import concat from "lodash/concat";
import isArray from "lodash/isArray";

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

            // todo - this is so big now - should it be moved into create-pivot-config.js?
            // todo - pass the grid options into it
            // take the first row of the data and count the dimensions
            const dimensionality = data[0].key ? data[0].key.length : 0;
            /*
                row and column positions
                The set position of the dimensions that are used to produce the rows/columns of the pivot grid. You can specify a single value or an array.
                can be either a number or an array
             */
            let rowPositions = gridOptions.pivotRowPositions;
            let columnPositions = gridOptions.pivotColumnPositions;

            /*
                row and column dimensions
                An array of row/column group headings ["pivot column a", "pivot column b"]
                a number representing the number of dimensions from the original data set that will be used as ]rows/columns in the pivot grid
             */
            let rowDimensions = gridOptions.pivotRowDimensions;
            let columnDimensions = gridOptions.pivotColumnDimensions;

            if (rowDimensions) {
                rowDimensions = validateDimensions(rowDimensions, 'row');
            }
            if (columnDimensions) {
                columnDimensions = validateDimensions(columnDimensions, 'column');
            }

            /*
               row and column indexes drive the pivot table
               they decide which indexes from the keyed data go on which dimension (row, column or both)
               they are extracted from EITHER the row/column-positions OR the row/column-dimensions attributes
               if both are present:
               the row/column-positions attribute will be used for the indexes
               and the row/column-dimensions attribute used for row/column group headings
             */
            let rowIndexes;
            if (!isUndefined(rowPositions)) {
                if (!isArray(rowPositions)) {
                    rowPositions = [rowPositions];
                }
                rowIndexes = validateSetPosition(rowPositions, 'row-set-position');
            } else {
                const rowCount = isArray(rowDimensions) ? size(rowDimensions) : rowDimensions;
                rowIndexes = pivotRowSizeToIndex(rowCount);
            }

            let columnIndexes;
            if (!isUndefined(columnPositions)) {
                if (!isArray(columnPositions)) {
                    columnPositions = [columnPositions];
                }
                columnIndexes = validateSetPosition(columnPositions, 'column-set-position');
            } else {
                const columnCount = isArray(columnDimensions) ? size(columnDimensions) : columnDimensions;
                columnIndexes = pivotColumnSizeToIndex(dimensionality, size(rowIndexes), columnCount);
            }

            validatePivotRowsAndColumns(rowIndexes, columnIndexes, dimensionality);

            let rowLabels = gridOptions.pivotRowTitles;
            // must be an array of arrays, not a single array
            if (rowLabels) {
                if (!isArray(rowLabels[0])) {
                    rowLabels = [rowLabels];
                }
            }
            const displayPivotRowCalc = gridOptions.displayPivotRowCalc;

            let columnLabels = gridOptions.pivotColumnTitles;
            if (columnLabels) {
                if (!isArray(columnLabels[0])) {
                    columnLabels = [columnLabels];
                }
            }

            const displayPivotColumnCalc = gridOptions.displayPivotColumnCalc;
            const enableTotals = calculatePivotDisplayCalcs(displayPivotRowCalc, displayPivotColumnCalc);

            const pivotConfig = {
                rows: rowIndexes,
                cols: columnIndexes,
                enableTotals: enableTotals
            };

            if (!isUndefined(rowLabels) || !isUndefined(columnLabels)) {
                const labelConfig = createLabelsConfig(rowLabels, columnLabels, rowIndexes, columnIndexes);
                if (size(labelConfig)) {
                    pivotConfig.labels = labelConfig;
                }
            }

            let pivotHeaders = concat(extractLabels(rowDimensions), extractLabels(columnDimensions));
            if (size(pivotHeaders)) {
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
