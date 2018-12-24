const Enums = {
    DataType: {
        "INTEGER": "INTEGER",
        "REAL": "REAL",
        "CONSTRAINT": "CONSTRAINT",
        "DECISION_VARIABLE": "DECISION_VARIABLE",
        "STRING": "STRING"
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
let _filterFloat = (value) => {
    if (/^(\-|\+)?([0-9]+(\.([0-9]*))?|Infinity)$/
        .test(value))
        return Number(value);
    return NaN;
};

let _getFormatter = (columnConfig) => {
    if (columnConfig.format) {
        return columnConfig.format;
    } else {
        switch (columnConfig.elementType) {
            case Enums.DataType.INTEGER:
                return window.insight.Formatter.format.integer;
            case Enums.DataType.REAL:
            case Enums.DataType.CONSTRAINT:
            case Enums.DataType.DECISION_VARIABLE:
                return window.insight.Formatter.format.decimal;
        }
    }
};

let _formatSearchDataIfNecessary = (searchData, displayType, format) => {
    //Check if the searchData is a number. If so, apply the appropriate formatter, else assume it is already formatted
    var columnIsFloatingPoint = displayType === Enums.DataType.REAL
        || displayType === Enums.DataType.DECISION_VARIABLE
        || displayType === Enums.DataType.CONSTRAINT;
    var columnIsInteger = displayType === Enums.DataType.INTEGER;

    if (!columnIsFloatingPoint && !columnIsInteger) {
        return searchData;
    }

    var searchDataAsFloat = _filterFloat(searchData);
    if (columnIsFloatingPoint && searchDataAsFloat) {
        return window.insight.Formatter.formatNumber(searchData, format);
    } else if (columnIsInteger && parseInt(searchData, 10) === searchDataAsFloat) {
        return window.insight.Formatter.formatNumber(searchData, format);
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

let _exactCompareAsNumberRounded = (searchData, data, columnConfig) => {
    let searchTermAsFloat = _filterFloat(searchData);
    let originalValueAsFloat = _filterFloat(data);

    let roundedOriginalValue;
    let decimalPlaces;

    // work out how many decimal places we are working to and round to that number
    let format = _getFormatter(columnConfig);
    decimalPlaces = format.length - (format.indexOf('.') + 1);
    roundedOriginalValue = _filterFloat(originalValueAsFloat.toFixed(decimalPlaces));

    return searchTermAsFloat === roundedOriginalValue;
};

let _exactMatchCell = (searchData, data, column) => {
    let result = true;

    if (!column.elementType || column.elementType === Enums.DataType.STRING) {
        result = _exactCompareAsString(searchData, data);
    } else {
        result = _exactCompareAsNumber(searchData, data);

        if (!result) {
            result = _exactCompareAsNumberRounded(searchData, data, column);
        }
    }
    return result;
};

let _partialMatchCell = (searchData, data, column) => {
    data = data.toLowerCase();
    searchData = searchData.toLowerCase();

    // If search term is an empty string then need to perform an exact match
    if (searchData === '') {
        return data === searchData;
    }

    var result = data.indexOf(searchData) >= 0;

    if (!result && column.elememtType !== Enums.DataType.STRING) {
        var format = _getFormatter(column);
        if (format) {
            var formattedSearchData = _formatSearchDataIfNecessary(searchData, column.displayType, format);
            var formattedCellData = window.insight.Formatter.formatNumber(data, format);
            result = formattedCellData.indexOf(formattedSearchData) >= 0;
        }
    }
    return result;
};

let integerFilter = (column, valueTxt, cellValue, rowData, params) => {
    var exactColumnSearch = valueTxt.substring(0, 1) === '=';
    if(exactColumnSearch) {
        return _exactMatchCell(valueTxt.substring(1), cellValue.toString(), column);
    }
    return _partialMatchCell(valueTxt, cellValue.toString(), column);
};

let realFilter = (column, valueTxt, cellValue, rowData, params) => {
    var exactColumnSearch = valueTxt.substring(0, 1) === '=';
    if(exactColumnSearch) {
        return _exactMatchCell(valueTxt.substring(1), cellValue.toString(), column);
    }
    return _partialMatchCell(valueTxt, cellValue.toString(), column);
};

export let chooseColumnFilter = (column) => {
    switch (column.elementType) {
        case "INTEGER":
            return _.partial(integerFilter, column);
            break;
        case "REAL":
            return _.partial(realFilter, column);
            break;
        default:
            debugger; // Matches for other datatypes?
            break;
    }
};