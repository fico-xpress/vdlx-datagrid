import partial from 'lodash/partial';
import {insight} from '../insight-globals';

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

let _getFormatter = columnConfig => {
    if (columnConfig.format) {
        return columnConfig.format;
    } else {
        switch (columnConfig.elementType) {
            case Enums.DataType.INTEGER:
                return insight.Formatter.format.integer;
            case Enums.DataType.REAL:
            case Enums.DataType.CONSTRAINT:
            case Enums.DataType.DECISION_VARIABLE:
                return insight.Formatter.format.decimal;
        }
    }
};

let _formatSearchDataIfNecessary = (searchData, displayType, format) => {
    //Check if the searchData is a number. If so, apply the appropriate formatter, else assume it is already formatted
    var columnIsFloatingPoint =
        displayType === Enums.DataType.REAL ||
        displayType === Enums.DataType.DECISION_VARIABLE ||
        displayType === Enums.DataType.CONSTRAINT;
    var columnIsInteger = displayType === Enums.DataType.INTEGER;

    if (!columnIsFloatingPoint && !columnIsInteger) {
        return searchData;
    }

    var searchDataAsFloat = _filterFloat(searchData);
    if (columnIsFloatingPoint && searchDataAsFloat) {
        return insight.Formatter.formatNumber(searchData, format);
    } else if (columnIsInteger && parseInt(searchData, 10) === searchDataAsFloat) {
        return insight.Formatter.formatNumber(searchData, format);
    }

    return searchData;
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
 * @param searchData
 * @param cellData
 * @param columnConfig
 * @returns {boolean}
 * @private
 */
let _exactCompareAsNumberRounded = (searchData, cellData, columnConfig) => {
    let searchTermAsFloat = _filterFloat(searchData);
    let originalValueAsFloat = _filterFloat(cellData);

    let roundedOriginalValue;
    let decimalPlaces;

    // work out how many decimal places we are working to and round to that number
    let format = _getFormatter(columnConfig);
    decimalPlaces = format.length - (format.indexOf('.') + 1);
    roundedOriginalValue = _filterFloat(originalValueAsFloat.toFixed(decimalPlaces));

    return searchTermAsFloat === roundedOriginalValue;
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

        if (!result) {
            result = _exactCompareAsNumberRounded(searchText, cellData, column);
        }
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

    var result = cellData.indexOf(searchText) >= 0;

    if (!result && column.elememtType !== Enums.DataType.STRING) {
        var formatter = _getFormatter(column);
        if (formatter) {
            var formattedSearchData = _formatSearchDataIfNecessary(searchText, column.displayType, formatter);
            var formattedCellData = insight.Formatter.formatNumber(cellData, formatter);
            result = formattedCellData.indexOf(formattedSearchData) >= 0;
        }
    }
    return result;
};

const EQUALS_OPERATOR = '=';
const NOT_OPERATOR = '!';
const LESS_THAN_OPERATOR = '<';
const GREATER_THAN_OPERATOR = '>';

let filter = (column, searchText, cellValue, rowData, params) => {
    debugger;
    const firstChar = searchText.substring(0, 1);
    var exactColumnSearch = firstChar === EQUALS_OPERATOR;
    if (exactColumnSearch) {
        return _exactMatchCell(searchText.substring(1), String(cellValue), column);
    }
    if(!!column.elementType && (column.elementType === Enums.DataType.INTEGER || column.elementType === Enums.DataType.REAL)) {
        const secondChar = searchText.length > 1 ? searchText.substring(1,2) : '';
        if (firstChar === LESS_THAN_OPERATOR) {
            if(secondChar === EQUALS_OPERATOR) { // '<='
                var searchValue = parseFloat(searchText.substr(2));
                return cellValue <= searchValue;
            } else if(secondChar === GREATER_THAN_OPERATOR) { // '<>'
                var searchValue = searchText.substr(2);
                return cellValue !== searchValue;
            } else { // '<'
                var searchValue = parseFloat(searchText.substr(1));
                return cellValue < searchValue;
            }
        } else if (firstChar === GREATER_THAN_OPERATOR) {
            if(secondChar === EQUALS_OPERATOR) { // '>='
                var searchValue = parseFloat(searchText.substr(2));
                return cellValue >= searchValue;
            } else { // '>'
                var searchValue = parseFloat(searchText.substr(1));
                return cellValue > searchValue;
            }
        } else if (firstChar === NOT_OPERATOR && secondChar === EQUALS_OPERATOR) { // '!='
            var searchValue = searchText.substr(2);
            return cellValue !== searchValue;
        }
    }
    return _partialMatchCell(searchText, String(cellValue), column);
};

export const TESTING_ONLY = {
    _filterFloat,
    _exactCompareAsNumber,
    _exactCompareAsNumberRounded
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
