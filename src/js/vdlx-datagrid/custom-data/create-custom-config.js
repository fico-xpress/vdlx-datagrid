import {COLUMN_SORTERS, ROW_DATA_TYPES} from "../../constants";
import {chooseColumnFilter, Enums} from "../grid-filters";
import assign from "lodash/assign";
import cloneDeep from "lodash/cloneDeep";
import map from "lodash/map";
import isPlainObject from "lodash/isPlainObject";
import isArray from "lodash/isArray";
import isNaN from "lodash/isNaN";
import isBoolean from "lodash/isBoolean";
import toNumber from "lodash/toNumber";
import reduce from "lodash/reduce";

export const getRowDataType = (row) => {
    if (isPlainObject(row)) {
        return ROW_DATA_TYPES.object;
    }
    if (isArray(row)) {
        return ROW_DATA_TYPES.array;
    }
    return ROW_DATA_TYPES.primitive;
}

export const createCustomConfig = (gridOptions) => {

    // clone the gridOptions data so not updating original
    let data = cloneDeep(gridOptions.data());
    const itemOne = data[0];

    const rowDataType = getRowDataType(itemOne);
    console.log('ROW DATA TYPE: ' + rowDataType);

    // table data will be an array of objects
    let tableData = data;

    // first convert any data that is not an object
    if (rowDataType === ROW_DATA_TYPES.array) {
        tableData = convertArrayOfArraysData(data);
    }
    if (rowDataType === ROW_DATA_TYPES.primitive) {
        tableData = convertPrimitiveArray(data);
    }
    const tableDataOne = tableData[0];
    let columns = createAutoColumnDefinitions(tableDataOne);

    if (gridOptions.columnFilter) {
        columns = map(columns, configureColumnFilter);
    }

    return {
        columns: columns,
        data: tableData
    };
}

export const convertArrayOfArraysData = (data) => {
    const converted = map(data, (row) => {
        return reduce(row, (memo, row, index, c) => {
            assign(memo, {['column ' + index]: row})
            return memo;
        }, {});
    })
    return converted;
};

export const convertPrimitiveArray = (data) => {
    const converted = map(data, (datum) => {
        return {
            'column 0': datum
        }
    })
    return converted;
};

export const createColumnDefinition = (val, key) => {
    const requiredProps = {
        id: key,
        field: key,
        title: key
    }
    // string column
    if (isNaN(toNumber(val))) {
        return assign(requiredProps, {
            sorter: COLUMN_SORTERS.string,
            elementType: Enums.DataType.STRING
        });
    }
    // boolean column with checkbox
    if (isBoolean(val)) {
        const checkboxFormatter = (cell) => {
            const checked = cell.getValue() ? 'checked' : '';
            const disabled = 'disabled';
            return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
        };

        return assign(requiredProps, {
            sorter: COLUMN_SORTERS.boolean,
            elementType: Enums.DataType.BOOLEAN,
            formatter: checkboxFormatter}
        );
    }
    // numeric column
    return assign(requiredProps, {
        sorter: COLUMN_SORTERS.number,
        elementType: Enums.DataType.INTEGER,
        cssClass: 'numeric'
    });
}

export const createAutoColumnDefinitions = (datum) => {
    return map(datum, createColumnDefinition);
};

export const configureColumnFilter = (col) => {

    const getCustomHeaderFilterFn = () => {

        const columnFilter = chooseColumnFilter(col);

        if (columnFilter) {
            return (valueTxt, cellValue, rowData, params) => {
                return columnFilter(valueTxt, cellValue, rowData, params);
            };
        }
        return undefined;
    };

    let filterConfig = {
        headerFilterPlaceholder: 'No filter',
        headerFilter: true,
        headerFilterFunc: getCustomHeaderFilterFn()
    };
    return assign(col, filterConfig);
}
