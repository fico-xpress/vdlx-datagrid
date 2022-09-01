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

import {COLUMN_SORTERS, EDITOR_TYPES, ROW_DATA_TYPES} from "../../constants";
import {Enums} from "../grid-filters";
import {getDataType, getRowDataType} from "./custom-data-utils";
import has from "lodash/has";
import every from "lodash/every";
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

    if (getRowDataType(data) !== ROW_DATA_TYPES.object) {
        throw Error('Error for component vdlx-datagrid: Invalid column definition, data incompatible with column definition.');
    }

    if (!every(columnDefinitions, isObjectDefinitionColValid)) {
        throw Error('Error for component vdlx-datagrid: Invalid column definition, the field attribute is missing or empty.');
    }

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
            ...createBasicColumnDefinition(column.field, colValue,column.title || column.field)
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

// check have the value and label attrs
export const validateLabelsData = (columnDefinitions) => {
    if (!every(columnDefinitions, isLabelObjectValid)) {
        throw Error('Error for component vdlx-datagrid: Invalid column definition, the value and/or label attribute is missing or empty.');
    }
    return true;
}

// overrides any undesirable attributes set by the user - only editable at this time
export const overrideCustomColumnAttributes = (columnDefinitions) => {
    return map(columnDefinitions, (column) => {
        if (!isUndefined(column.editable)) {
            return assign(column, { editable: false});
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
