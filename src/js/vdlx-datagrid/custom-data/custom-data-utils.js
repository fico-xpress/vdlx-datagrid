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
import {COLUMN_SORTERS, EDITOR_TYPES, ROW_DATA_TYPES} from "../../constants";
import reduce from "lodash/reduce";
import assign from "lodash/assign";
import {Enums} from "../grid-filters";
import isNaN from "lodash/isNaN";
import toNumber from "lodash/toNumber";
import isBoolean from "lodash/isBoolean";
import parseInt from "lodash/parseInt";

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

export const getDataType = (data) => {
    if (isNaN(toNumber(data))) {
        return Enums.DataType.STRING
    } else if (isBoolean(data)) {
        return Enums.DataType.BOOLEAN;
    } else {
        return Enums.DataType.INTEGER;
    }
}

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

// todo - give this idea some thought
export const createVdlxDatagridColumnProperties = (gridOptions) => {
    const freezeColumns = parseInt(gridOptions.freezeColumns);
    const includeFilter = gridOptions.columnFilter || false;
}
