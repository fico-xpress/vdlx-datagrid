/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/utils.js
   ```````````````````````
   vdlx-datagrid utils.

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

import {EDITOR_TYPES} from "../constants";
import find from "lodash/find";
import isUndefined from "lodash/isUndefined";
import get from "lodash/get";

export const FILTER_PLACEHOLDER_TEXT = 'No Filter';

export const checkboxFilterFunc = (value, cellValue, rowData, params) => {
    const valueString = String(value);
    const cellValueTxt = String(cellValue);
    if (valueString === cellValueTxt) {
        return true;
    }

    const optionMatch = find(
        params.values,
        (keyValue) => keyValue.value === valueString || keyValue.label === valueString
    );
    if (isUndefined(optionMatch)) {
        return false;
    }
    return optionMatch.value === cellValueTxt;
};

export const getHeaderFilterParams = (column, entityOptions) => {
    if (column.editor === EDITOR_TYPES.checkbox) {
        const checkedValue = get(entityOptions, 'checkedValue', true);
        const uncheckedValue = get(entityOptions, 'uncheckedValue', false);
        return {
            values: [
                {value: undefined, label: FILTER_PLACEHOLDER_TEXT},
                {value: String(checkedValue), label: 'Checked'},
                {value: String(uncheckedValue), label: 'Unchecked'},
            ],
        };
    }
};

export const getHeaderFilterEmptyCheckFn = (column, headerFilterParams) => {

    const checkboxFilterEmptyCheck = (value) => {
        if (value == null) {
            return true;
        }
        const valueString = String(value);
        const optionMatch = find(
            headerFilterParams.values,
            (keyValue) => keyValue.value === valueString || keyValue.label === valueString
        );
        return isUndefined(optionMatch) || isUndefined(optionMatch.value);
    }

    if (column.editor === EDITOR_TYPES.checkbox) {
        return checkboxFilterEmptyCheck;
    }
    return undefined;
};

