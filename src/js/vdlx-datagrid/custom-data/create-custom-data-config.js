import {COLUMN_SORTERS, EDITOR_TYPES, ROW_DATA_TYPES} from "../../constants";
import {chooseColumnFilter, Enums} from "../grid-filters";
import cloneDeep from "lodash/cloneDeep";

const getRowDataType = (row) => {
    if (_.isPlainObject(row)) {
        return ROW_DATA_TYPES.object;
    }
    if (_.isArray(row)) {
        return ROW_DATA_TYPES.array;
    }
    return ROW_DATA_TYPES.primitive;
}


const createCustomDataConfig = (gridOptions) => {

    // clone the gridOptions data so not updating original
    let data = cloneDeep(gridOptions.data());
    const itemOne = data[0];

    const rowDataType = getRowDataType(itemOne);
    console.log('ROW DATA TYPE: ' + rowDataType);

    // table data will be an array of objects
    let tableData = data;
    // first convert any data that is not an object

    if (rowDataType === ROW_DATA_TYPES.array) {
        tableData = convertTupleData(data);
    }
    if (rowDataType === ROW_DATA_TYPES.primitive) {
        tableData = convertPrimitiveArray(data);
    }
    const tableDataOne = tableData[0];
    let columns = createAutoColumnConfig(tableDataOne);

    if (gridOptions.columnFilter) {
        columns = _.map(columns, configureCustomColumnFilter);
    }
    return {
        columns: columns,
        data: tableData
    };

}

// pretty basic at the moment - will check functionality requirements of this
// only interested in tuples - larger arrays treated as tuples
const convertTupleData = (data) => {
    const converted = _.map(data, (datum) => {
        return {
            label: datum[0],
            value: datum[1]
        }
    })
    return converted;
};

const convertPrimitiveArray = (data) => {
    const converted = _.map(data, (datum) => {
        return {
            value: datum
        }
    })
    return converted;
};

const getColumnConfig = (val, key) => {

    // string column
    if (_.isNaN(_.toNumber(val))) {
        return {
            id: key,
            field: key,
            title: key,
            sorter: COLUMN_SORTERS.string,
            elementType: Enums.DataType.STRING
        };
    }
    // boolean column with checkbox
    if (_.isBoolean(val)) {

        const checkboxFormatter = (cell) => {
            const checked = cell.getValue() ? 'checked' : '';
            const disabled = 'disabled';
            return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
        };

        return {
            id: key,
            field: key,
            title: key,
            sorter: COLUMN_SORTERS.boolean,
            elementType: Enums.DataType.BOOLEAN,
            formatter: checkboxFormatter
        }
    }

    // numeric column
    return {
        id: key,
        field: key,
        title: key,
        sorter: COLUMN_SORTERS.number,
        elementType: Enums.DataType.INTEGER,
        cssClass: 'numeric'
    };
}

const createAutoColumnConfig = (datum) => {
    let cols = _.map(datum, getColumnConfig);
    // debug val
    return cols;
};

export const configureCustomColumnFilter = (col) => {

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
    return _.assign(col, filterConfig);
}

export default createCustomDataConfig;
