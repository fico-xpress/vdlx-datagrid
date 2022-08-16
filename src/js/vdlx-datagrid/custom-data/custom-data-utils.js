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
