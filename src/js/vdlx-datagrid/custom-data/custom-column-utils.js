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

import {APPROVED_COLUMN_PROPS, COLUMN_SORTERS, EDITOR_TYPES} from "../../constants";
import {Enums} from "../grid-filters";
import {getDataType} from "./custom-data-utils";
import keys from "lodash/keys";
import omit from "lodash/omit";
import difference from "lodash/difference";

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

export const createBasicColumnDefinition = (key, value) => {
    return {
        id: key,
        field: key,
        title: key,
        ...createValueTypedColumnProperties(value)
    };
}
/**
 * remove any property not on the approved list
 * @param column
 * @returns {*}
 */
export const removePropsNotInApprovedList = (column) => {
    const colProps = keys(column);
    const approvedColumnProps = keys(APPROVED_COLUMN_PROPS);
    const invalidProps = difference(colProps, approvedColumnProps);
    return omit(column, invalidProps);
}
