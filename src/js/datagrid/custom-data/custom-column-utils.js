/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/custom-data/custom-column-utils.js
   ```````````````````````
   vdlx-datagrid custom-column-utils.

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

import {COLUMN_SORTERS, EDITOR_TYPES} from "../../constants";
import {pivotDataModule} from "./custom-data-pivot";

import {Enums} from "../grid-filters";
import {getDataType} from "./custom-data-utils";
import has from "lodash/has";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import get from "lodash/get";
import toString from "lodash/toString";
import assign from "lodash/assign";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import find from "lodash/find";
import keys from "lodash/keys";
import intersection from "lodash/intersection";
import isArray from "lodash/isArray";
import toNumber from "lodash/toNumber";
import toUpper from "lodash/toUpper";
import times from "lodash/times";
import isNaN from "lodash/isNaN";
import size from "lodash/size";
import slice from "lodash/slice";
import uniq from "lodash/uniq";
import concat from "lodash/concat";
import forEach from "lodash/forEach";

/**
 * create column properties that are data value type related
 * @param value
 * @returns {}
 */
export const createValueTypedColumnProperties = (value) => {
    switch (getDataType(value)) {
        case Enums.DataType.BOOLEAN:
            const checkboxFormatter = (cell) => {
                const checked = cell.getValue() ? 'checked' : '';
                const disabled = 'disabled';
                return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
            };
            return {
                editor: EDITOR_TYPES.checkbox,
                sorter: COLUMN_SORTERS.boolean,
                elementType: Enums.DataType.BOOLEAN,
                formatter: checkboxFormatter
            };
        case Enums.DataType.INTEGER:
            return {
                editor: EDITOR_TYPES.text,
                sorter: COLUMN_SORTERS.number,
                elementType: Enums.DataType.INTEGER,
                cssClass: 'numeric'
            }
        case Enums.DataType.STRING:
            return {
                editor: EDITOR_TYPES.text,
                sorter: COLUMN_SORTERS.string,
                elementType: Enums.DataType.STRING
            };
        default:
            console.error('unrecognised data type');
            return {};
    }
}

/**
 * create a column definition
 * @param key
 * @param value
 * @param label
 * @returns {{field, editable: boolean, id, title: *}}
 */
export const createBasicColumnDefinition = (key, value, label) => {
    const keyStr = toString(key);
    const labelStr = toString(label);
    return {
        editable: false,
        field: keyStr,
        id: keyStr,
        title: !isUndefined(label) ? labelStr : keyStr,
        ...createValueTypedColumnProperties(value)
    };
}
/**
 * validate user defined column
 * @param column
 * @returns {boolean}
 */
export const isObjectDefinitionColValid = (column) => {
    return has(column, 'field') && !isUndefined(column.field) && column.field !== '';
}

// check all definitions have the field attr
export const validateObjectColDefinitions = (columnDefinitions, data) => {

    // if (getRowDataType(data) !== ROW_DATA_TYPES.object) {
    //     throw Error('Error for component vdlx-datagrid: Invalid column definition, data incompatible with column definition.');
    // }
    //
    // if (!every(columnDefinitions, isObjectDefinitionColValid)) {
    //     throw Error('Error for component vdlx-datagrid: Invalid column definition, the field attribute is missing or empty.');
    // }

    const props = keys(data);
    const fields = map(columnDefinitions, 'field');
    if (isEmpty(intersection(props, fields))) {
        throw Error('Error for component vdlx-datagrid: Invalid column definition, no matching field attributes in the data.');
    }

    return true;
}
/**
 * convert user definied columns into the required format
 * @param colDefinitions
 * @param data
 * @returns {*}
 */
export const convertObjectColDefinitions = (colDefinitions, data) => {
    // pick the data attr by using the col definition field attr
    return map(colDefinitions, (column) => {
        const colValue = get(data, column.field, '');
        return {
            ...column,
            ...createBasicColumnDefinition(column.field, colValue, column.title || column.field)
        };
    });
}

/**
 * validate label data
 * @param labelObject
 * @returns {boolean}
 */
export const isLabelObjectValid = (labelObject) => {
    return has(labelObject, 'value') && !isUndefined(labelObject.value) && has(labelObject, 'label')
}

//todo - disabled the validation - come back to this
// check have the value and label attrs
export const validateLabelsData = (columnDefinitions) => {
    // if (!every(columnDefinitions, isLabelObjectValid)) {
    //     throw Error('Error for component vdlx-datagrid: Invalid column definition, the value and/or label attribute is missing or empty.');
    // }
    return true;
}

// overrides any undesirable attributes set by the user - only editable at this time
export const overrideCustomColumnAttributes = (columnDefinitions) => {
    return map(columnDefinitions, (column) => {
        if (!isUndefined(column.editable)) {
            return assign(column, {editable: false});
        }
        return column
    });
}

/**
 * if present, the sort order columns will be determind by the headerSortStartingDir attr.
 * if not present, the sort order will be the first visible column
 * @param columnDefinitions
 * @returns {[{column, dir: string}]|*[]|*}
 */
export const createCustomColumnSortOrder = (columnDefinitions) => {

    if (isEmpty(columnDefinitions)) {
        return [];
    }

    const sortOrder =
        map(
            filter(columnDefinitions, (col) => (isUndefined(col.visible) || col.visible === true) && !isUndefined(col.headerSortStartingDir)),
            (col) => {
                return {
                    column: col.field,
                    dir: col.headerSortStartingDir,
                };
            });

    if (!isEmpty(sortOrder)) {
        return sortOrder;
    }

    const firstVisibleCol = find(columnDefinitions, (col) => isUndefined(col.visible) || col.visible === true);
    return [{column: firstVisibleCol.field, dir: 'asc'}];
}

/**
 * starting from zero, create an array of ascending integers
 * @param length of the created array
 * @returns [number]
 */
export const pivotRowSizeToIndex = (length) => {
    return times(length, (i) => i);
}

/**
 * given a total size, a row and column count, calculate column index positions
 * @param dimensionality
 * @param rowCount
 * @param columnCount
 * @returns {*[]|*}
 */
export const pivotColumnSizeToIndex = (dimensionality, rowCount, columnCount) => {
    if (columnCount) {
        const indexArray = times(dimensionality);
        const sliceEnd = rowCount + columnCount;
        return slice(indexArray, rowCount, sliceEnd);
    }
    return [];
}


export const validatePivotRowsAndColumns = (rows, cols, dimensionality) => {
    const uniqueValues = uniq(concat(rows, cols));
    const rowColSize = size(uniqueValues);
    // compare against length of unique values - in case rows and cols share the same values
    if (rowColSize > dimensionality) {
        throw Error(`Error for component vdlx-pivotgrid: The sum of row and column sizes ${rowColSize}, exceeds the dimensionality of the data ${dimensionality}`);
    }
    forEach(uniqueValues, (pos) => {
        if (pos > dimensionality) {
            throw Error(`Error for component vdlx-pivotgrid: The row or column position ${pos} must not exceed the dimensionality of the data ${dimensionality}`);
        }
    })
    return true;
}


export const calculatePivotDisplayCalcs = (displayRowCal, displayColumnCalc) => {

    const totalsEnum = pivotDataModule.OptionEnums.EnableTotals;
    const rowCalc = toUpper(displayRowCal) === 'TRUE';
    const columnCalc = toUpper(displayColumnCalc) === 'TRUE';

    if (rowCalc && columnCalc) {
        return totalsEnum.All;
    } else if (rowCalc && !columnCalc) {
        return totalsEnum.Rows;
    } else if (!rowCalc && columnCalc) {
        return totalsEnum.Cols;
    } else if (!rowCalc && !columnCalc) {
        return totalsEnum.None;
    }
}


/**
 * todo
 * todo
 *  --- todo standardise the error messages, they are inconsistent with each other
 * todo
 * todo
 *
 */

/**
 * the dimensions can either be a number, or an array
 * if array, contents can be strings or numbers
 * if primitive, it must be a value that can be cast as a number
 * @param dimensions
 * @returns {*}
 */
export const validateDimensions = (dimensions, dimensionName) => {
    if (isArray(dimensions)) {
        return dimensions;
    } else if (!isNaN(toNumber(dimensions))) {
        return toNumber(dimensions);
    } else {
        throw Error(`Error for component vdlx-pivotgrid: Invalid ${dimensionName}-dimensions.  Supported format: An array of ${dimensionName} group headings [headingOne, headingTwo], or a number representing the required amount of ${dimensionName}s.`);
    }
}

/**
 * convert dimensions into array of strings
 * @param dimensions
 * @returns {*[]|*}
 */
export const extractLabels = (dimensions) => {
    if (isUndefined(dimensions)) {
        return [];
    } else if (isArray(dimensions)) {
        return map(dimensions, toString);
    } else {
        return [toString(dimensions)];
    }
}

/**
 * the set position can be either an array or a single number
 * if array, all values must be cast-able to numbers
 * if not and array it must be a value that can be cast as a number
 * @param arr
 * @param attrName
 * @returns {*}
 */
export const validateSetPosition = (arr, attrName) => {
    const asNumbers = map(arr, (val) => {
        const num = toNumber(val);
        if (isNaN(num)) {
            throw Error(`Error for component vdlx-pivotgrid: ${val} is not a valid ${attrName}, it must be either a number, or an array of numbers.`);
        } else {
            return num;
        }
    });
    return asNumbers;
}
