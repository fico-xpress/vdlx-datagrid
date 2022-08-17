/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/utils.js
   ```````````````````````
   vdlx-datagrid utils.

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

//todo - this is rough - to be improved
export const getDataType = (data) => {
    if (isNaN(toNumber(data))) {
        return Enums.DataType.STRING
    } else if (isBoolean(data)) {
        return Enums.DataType.BOOLEAN;
    } else {
        return Enums.DataType.INTEGER;
    }
}

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

export const convertArrayOfArraysData = (data) => {
    return map(data, (row) => {
        return reduce(row, (memo, row, index) => {
            assign(memo, {['column ' + index]: row})
            return memo;
        }, {});
    });
};

export const convertPrimitiveArray = (data) => {
    return map(data, (datum) => {
        return {
            'column 0': datum
        }
    });
};

export const convertObjectDataToLabelData = (data) => {
    const newData = reduce(data, function (memo, row, index) {
        assign(memo, {
            [index.toString()]:
            row.value
        });
        return memo;
    }, {});
    return [newData];
}
