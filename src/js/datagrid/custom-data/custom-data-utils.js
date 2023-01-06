/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/custom-data/custom-data-utils.js
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

import map from 'lodash/map';
import isArray from "lodash/isArray";
import isPlainObject from "lodash/isPlainObject";
import isFunction from "lodash/isFunction";
import {ROW_DATA_TYPES} from "../../constants";
import reduce from "lodash/reduce";
import assign from "lodash/assign";
import {Enums} from "../grid-filters";
import isNaN from "lodash/isNaN";
import toNumber from "lodash/toNumber";
import isBoolean from "lodash/isBoolean";
import cloneDeep from "lodash/cloneDeep";
import toString from "lodash/toString";
import size from "lodash/size";
import concat from "lodash/concat";
import isString from "lodash/isString";
import isNumber from "lodash/isNumber";

/**
 * if a string can be converted to numeric then it will return INTEGER
 * @param data
 * @returns {string}
 */
export const getDataType = (data) => {
    if (isNaN(toNumber(data))) {
        return Enums.DataType.STRING
    } else if (isBoolean(data)) {
        return Enums.DataType.BOOLEAN;
    } else {
        return Enums.DataType.INTEGER;
    }
}
/**
 * determind the type of data used in a row
 * @param row
 * @returns {string}
 */
export const getRowDataType = (row) => {
    if (isPlainObject(row)) {
        return ROW_DATA_TYPES.object;
    }
    if (isArray(row)) {
        return ROW_DATA_TYPES.array;
    }
    if (isFunction(row)) {
        return ROW_DATA_TYPES.function;
    }
    return ROW_DATA_TYPES.primitive;
}

/**
 * ensures data in the correct array of objects format
 * @param data
 * @returns {*[]|*}
 */
export const convertCustomDataToObjectData = (data) => {
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
 * convert an array of arrays to an array of objects
 * @param data
 * @returns {*}
 */
export const convertArrayOfArraysData = (data) => {
    return map(data, (row) => {
        return reduce(row, (memo, row, index) => {
            assign(memo, {['column ' + index]: row})
            return memo;
        }, {});
    });
};

/**
 * convert an array of primitives to an array of objects
 * @param data
 * @returns {*}
 */
export const convertPrimitiveArray = (data) => {
    return map(data, (datum) => {
        return {
            'column 0': datum
        }
    });
};

/**
 * convert an array of key value objects to an array of objects keyed by the index
 * @param data
 * @returns {[undefined]}
 */
export const convertObjectDataToLabelData = (data) => {
    // create a single object containing properties for each row
    return [reduce(data, function (memo, row, index) {
        assign(memo, { [toString(index)]: row.value});
        return memo;
    }, {})];
}

export const castToArray = (value) => {
    if (!isArray(value)) {
        return [toNumber(value)];
    }
    return value;
}

export const columnCountToIndexes = (size, rowCount, colCount) => {
    // add some validation
    const rowColSize = (toNumber(rowCount) + toNumber(colCount));
    if (rowColSize > size) {
        throw Error(`The sum of row and column sizes ${rowColSize}, exceed the dimensionality of the data ${size}`);
    }

    let colCounter = colCount - 1;
    const cols = [];
    _.forEach(_.times(colCount), () => {
        cols.push(colCounter);
        colCounter ++;
    });

    return {
        rows: _.times(rowCount, (i) => i),
        columns: cols
    }
}

/**
 * converts arrays of primitive arrays to scenario data label array format
 * @param allArrays
 * @returns {(*)[]|*}
 */
export const convertPrimitiveArraysToLabelArrays = (allArrays) => {

    if (isArray(allArrays[0])) {
        return map(allArrays, (arr) => convertPrimitiveArrayToLabelArray(arr));
    } else {
        return [convertPrimitiveArrayToLabelArray(allArrays)];
    }
}

/**
 * convert an array of primitives to scenario data label array format
 * @param arr
 * @returns {*}
 */
export const convertPrimitiveArrayToLabelArray = (arr) => {
    // check first row only
    if (isString(arr[0]) || isNumber(arr[0])){
        return  map(arr, (datum, index) => ({value:index, label:datum}));
    }
    return arr;
}

/**
 * convert multiple arrays of labels into a single array object
 * @param rowLabels
 * @param columnLabels
 * @returns {{}|*}
 */
export  const createLabelsConfig = (rowLabels, columnLabels) => {

    // if arrays contain primitive values convert to label array format
    const convertedRowLabels = convertPrimitiveArraysToLabelArrays(rowLabels);
    const convertedColumnLabels = convertPrimitiveArraysToLabelArrays(columnLabels);

    const labelArrays = concat(convertedRowLabels, convertedColumnLabels);

    if (size(labelArrays)) {
        return reduce(labelArrays, (memo, labArray, index) => {
            const labelConfig = reduce(labArray, (innerMemo, labObject) => {
                innerMemo = assign(innerMemo, {[labObject.value]: labObject.label});
                return innerMemo;
            }, {});

            memo = assign(memo, {[index]: labelConfig});
            return memo;
        }, {});

    } else {
        return {};
    }

}
