/*
   Xpress Insight vdlx-pivotgrid
   =============================

   file datagrid/custom-data/create-pivot-config.js
   ```````````````````````
   vdlx-pivotgrid utils.

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
import {pivotDataModule} from "./custom-data-pivot";
import {
    calculatePivotDisplayCalcs, extractLabels,
    pivotColumnSizeToIndex,
    pivotRowSizeToIndex,
    validateDimensions, validatePivotRowsAndColumns,
    validateSetPosition
} from "./custom-column-utils";
import isUndefined from "lodash/isUndefined";
import isArray from "lodash/isArray";
import size from "lodash/size";
import {createLabelsConfig} from "./custom-data-utils";
import concat from "lodash/concat";


/**
 * pivot configuration creation
 * @param gridOptions
 * @param data
 * @returns {{data: *[], cols}}
 */
export const createPivotConfig = (gridOptions, data) => {
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

    let columnLabels = gridOptions.pivotColumnTitles;
    if (columnLabels) {
        if (!isArray(columnLabels[0])) {
            columnLabels = [columnLabels];
        }
    }

    const enableTotals = calculatePivotDisplayCalcs(gridOptions.displayPivotRowCalc, gridOptions.displayPivotColumnCalc);

    /**
     * @type {Options}
     */
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

    // call the data pivoting module
    return pivotDataModule.run(data, pivotConfig);
}
