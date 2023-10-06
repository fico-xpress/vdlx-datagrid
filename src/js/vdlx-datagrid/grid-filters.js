import partial from 'lodash/partial';

/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/grid-filters.js
   ```````````````````````
   vdlx-datagrid grid-filters.

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

export const Enums = {
    DataType: {
        INTEGER: 'INTEGER',
        REAL: 'REAL',
        CONSTRAINT: 'CONSTRAINT',
        DECISION_VARIABLE: 'DECISION_VARIABLE',
        STRING: 'STRING'
    }
};

/**
 * Custom and stricter float matching than parseFloat
 * If it encounters anything other than a valid character then it returns NaN rather
 * than matching all characters to that point like parseFloat does.
 * @param value
 * @returns {*}
 * @private
 */
let _filterFloat = value => {
    if (/^(\-|\+)?([0-9]+(\.([0-9]*))?|Infinity)$/.test(value)) return Number(value);
    return NaN;
};

let _exactCompareAsString = (searchData, data) => {
    return searchData.toLowerCase() === data.toLowerCase();
};

let _exactCompareAsNumber = (searchData, data) => {
    let searchTermAsFloat = _filterFloat(searchData);
    let originalValueAsFloat = _filterFloat(data);

    return searchTermAsFloat === originalValueAsFloat;
};

/**
 *
 * @param searchText
 * @param cellData
 * @param column
 * @returns {*}
 * @private
 */
let _exactMatchCell = (searchText, cellData, column) => {
    let result = true;

    if (!column.elementType || column.elementType === Enums.DataType.STRING) {
        result = _exactCompareAsString(searchText, cellData);
    } else {
        result = _exactCompareAsNumber(searchText, cellData);
    }
    return result;
};

let _partialMatchCell = (searchText, cellData, column) => {
    cellData = cellData.toLowerCase();
    searchText = searchText.toLowerCase();

    // If search term is an empty string then need to perform an exact match
    if (searchText === '') {
        return cellData === searchText;
    }
    return cellData.indexOf(searchText) >= 0;
};

const EQUALS_OPERATOR = '=';
const NOT_OPERATOR = '!';
const LESS_THAN_OPERATOR = '<';
const GREATER_THAN_OPERATOR = '>';

const LT = (a,b) => a < b;
const LTEQ = (a,b) => a <= b;
const GT = (a,b) => a > b;
const GTEQ = (a,b) => a >= b;
const NEQ = (a,b) => a !== b;

let filter = (column, searchText, formattedCellValue, rowData, params) => {
    let cellValue;
    if(!!column.labelsEntity || column.filterByFormatted) {
        cellValue = formattedCellValue;
    } else {
        cellValue = rowData[column.id];
        // Treat empty/missing elements from a sparse numeric array as 0
        if (cellValue === '' && (column?.elementType === Enums.DataType.INTEGER || column?.elementType === Enums.DataType.REAL)) {
            cellValue = 0;
        }
    }
    const firstChar = searchText.substring(0, 1);
    let exactColumnSearch = firstChar === EQUALS_OPERATOR;
    if (exactColumnSearch) {
        return _exactMatchCell(searchText.substring(1), String(cellValue), column);
    }
    if(!!column.elementType && (column.elementType === Enums.DataType.INTEGER || column.elementType === Enums.DataType.REAL)) {
        const secondChar = searchText.length > 1 ? searchText.substring(1,2) : '';
        let operator_length = 0;
        let operator;
        if (firstChar === LESS_THAN_OPERATOR) {
            if(secondChar === EQUALS_OPERATOR) { // '<='
                operator_length = 2;
                operator = LTEQ;
            } else if(secondChar === GREATER_THAN_OPERATOR) { // '<>'
                operator_length = 2;
                operator = NEQ;
            } else { // '<'
                operator_length = 1;
                operator = LT;
            }
        } else if (firstChar === GREATER_THAN_OPERATOR) {
            if(secondChar === EQUALS_OPERATOR) { // '>='
                operator_length = 2;
                operator = GTEQ;
            } else { // '>'
                operator_length = 1;
                operator = GT;
            }
        } else if (firstChar === NOT_OPERATOR && secondChar === EQUALS_OPERATOR) { // '!='
            operator_length = 2;
            operator = NEQ;
        }
        if(operator_length) {
            var searchValue = parseFloat(searchText.substr(operator_length));
            if(isNaN(searchValue)) {
                return false;
            }
            return operator(cellValue, searchValue);
        }
    }
    return _partialMatchCell(searchText, String(cellValue), column);
};

export const TESTING_ONLY = {
    _filterFloat,
    _exactCompareAsNumber,
};

export let chooseColumnFilter = column => {
    switch (column.elementType) {
        case Enums.DataType.INTEGER:
        case Enums.DataType.STRING:
        case Enums.DataType.REAL:
            return partial(filter, column);
        default:
            return undefined;
    }
};
