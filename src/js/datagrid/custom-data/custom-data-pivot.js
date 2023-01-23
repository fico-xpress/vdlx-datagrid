/*
   Xpress Insight vdlx-pivotgrid
   =============================

   file datagrid/custom-data/custom-data-pivot.js
   ```````````````````````
   vdlx-pivotgrid utils.

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

/**
 * Before transformation:
 * | RowKey1 | RowKey2 | ColKey1 | ColKey2 | value |
 * |---------|---------|---------|---------|-------|
 * |   x     |   a     |   10    |  123    |   99  |
 * |   x     |   b     |   20    |  321    |   98  |
 *
 * After transformation:
 * |                    | ColKey1 |      10       |      20      |
 * |                    | ColKey2 |  123  |  321  |  123  | 321  |
 * | RowKey1 | RowKey2  |                                        |
 * |---------|----------|---------|-------|-------|-------|------|
 * |   x     |   a      |         |   99  |       |       |      |
 * |   x     |   b      |         |   99  |       |       |  98  |
 *
 *
 */

/**
 * Some constants used internally and in tabulator
 * @type {{totals: string}}
 */
const PIVOT_CONST_VALUES = {
    totals: '__totals',
    emptyCol: '__empty'
}

const CSS_INTERNALS = {
    pivotHeader: 'pivot-row-header',
    tabulatorCalcsBottom: 'tabulator-calcs-bottom',
    rowFrozen: 'tabulator-frozen'
}

function isValue(a) {
    return a !== undefined && a !== null;
}

function isNumber(a) {
    return isValue(a) && !isNaN(a);
}

function _countIfNotEmpty(a) {
    return isNumber(a) ? 1 : 0;
}

const re = new RegExp(`(\\s|^)${CSS_INTERNALS.tabulatorCalcsBottom}(\\s|$)`)
export const isTotalsRowComponent = (row) => {
    const rowCssClass = row.getData().cssClass;
    if (rowCssClass) {
        return re.test(rowCssClass);
    }
    return false;
}

/**
 * custom Numeric value sorter that will ensure (if present) the totals row will remain last
 * @param a - cell value
 * @param b - cell value to compare with a
 * @param rowA - row component for a
 * @param rowB- row component for b
 * @returns {number|null}
 */
export const customNumericSorter = (a, b, rowA, rowB) => {
    if (pivotDataUtils.isTotalsRowComponent(rowA) || pivotDataUtils.isTotalsRowComponent(rowB)) {
        return null;
    }
    return a - b;
}

/**
 * custom String value sorter that will ensure (if present) the totals row will remain last
 * @param a - cell value
 * @param b - cell value to compare with a
 * @param rowA - row component for a
 * @param rowB- row component for b
 * @returns {number|null}
 */
export const customStringSorter = (a, b, rowA, rowB) => {
    if (pivotDataUtils.isTotalsRowComponent(rowA) || pivotDataUtils.isTotalsRowComponent(rowB)) {
        return null;
    }
    const x = a.toString().toUpperCase();
    const y = b.toString().toUpperCase();
    return x == y ? 0 : x > y ? 1 : -1;
}

/**
 * The map of functions that can be used when calculating
 * aggregated values.
 *
 * - count: undefined and NaN are not considered a value and are excluded from the calculation.
 * This function is compatible with numeric and string values.
 * - min, max, sum: these functions are only compatible with numerical values. Any non-numerical
 * values will be ignored during the calculation.
 *
 * @type {{min: (function(*, *): *), max: (function(*, *): *), count: (function(*, *): *), sum: (function(*, *): *)}}
 */
export const totalsFun = {
    'sum': (a, b) => (isNumber(b)) ? (isNumber(a)) ? a + b : b : a,
    'min': (a, b) => (isNumber(b)) ? (isNumber(a)) ? ((a <= b) ? a : b) : b : a,
    'max': (a, b) => (isNumber(b)) ? (isNumber(a)) ? ((a >= b) ? a : b) : b : a,
    // FIXME The right implementation is the following but this is breaking some tests
    //  'count': (a, b) => (isValue(b)) ? isValue(a) ? a + _countIfNotEmpty(b) : _countIfNotEmpty(b) : a
    'count': (a, b) => (isValue(b)) ? isNumber(a) ? a + _countIfNotEmpty(b) : _countIfNotEmpty(b) : a
}

const OptionEnums = {
    AggregationTypes: {
        Sum: 'sum',
        Min: 'min',
        Max: 'max',
        Count: 'count'
    },
    EnableTotals: {
        All: 'all',
        Rows: 'row',
        Cols: 'column',
        None: 'none'
    }
}

/**
 * The options that can be passed to configure column definition
 * generation and data pivoting behavior.

 * aggregationType: sum | min | max | count | false. When set it will enable
 * calculating totals for rows and columns.
 *
 * @type {{aggregationType: string}}
 */
class Options {
    constructor(o) {
        /**
         * The aggregation function that is used to calculate the rows and columns
         * totals.
         * @type {string}
         */
        this.aggregationTotals = OptionEnums.AggregationTypes.Count;

        /**
         * The aggregation function that is used when the input data array contains
         * multiple values for the same keys.
         * @type {string}
         */
        this.aggregationValues = OptionEnums.AggregationTypes.Sum;

        /**
         * The aggregation function used to calculate totals
         * See OptionEnums.EnableTotals for available options
         */
        this.enableTotals = OptionEnums.EnableTotals.All;

        /**
         * The list of columns from the input data table that are used as row keys.
         * @type {(numeric)[]} */
        this.rows = [];

        /**
         * The list of columns from the input data table that are used column keys.
         * @type {(numeric)[]} */
        this.cols = [];

        this.labels = [];

        /**
         * The layout of the column definition. Can be one of the following:
         * - compact
         * - normal
         * @type {{string}}
         */
        this.layout = "normal";

        /**
         * An array containing header names. Index of this array maps to the
         * column index of the original data set. If header name is undefined
         * then a default name based on the column index is automatically generated.
         * @type {(string)[]} */
        this.header = [];

        /**
         * Overwrite object with passed in argument
         */
        if (o !== undefined) {
            Object.assign(this, o);
        }
    }
}

export class PivotContext {
    constructor() {
        this.rowMap = new ColHashMap();
        this.colMap = new ColHashMap();
        this.colDef = [];
    }
}

/**
 * This class represent an actual column data and is associated to a column in the
 * dataset.
 *
 * Design Principles
 *
 * The pivoted data is stored in an array of object that conforms to tabulator expected
 * data format. Each object represent a row in the table and each column is indexed using
 * a string containing a number (the column index). This principle reduces risk of ending up
 * with object attributes representing a column name _and_ a tabulator attribute.
 *

 * The 'number as string' format is a constraint of vdlx-data-grid OR tabulator.js (to be
 * determined). While this format might not be the best from a memory consumption perspective
 * (storing object VS storing array values) it might offer faster rendering time.
 *
 */
class ColSimpleDefinition {
    constructor(title, field, sortingFunc = customNumericSorter) {
        // Column name
        this.title = title;
        // Column index in the original data set
        // Tabulator expects the field to be a string because of 'nested field' feature
        this.field = field.toString();
        // required custom sorter to sort columns and data with totals at the bottom
        this.sorter = sortingFunc;
    }
}

/**
 * ColSimpleDefinition, but with string sorter
 */
class StringColSimpleDefinition extends ColSimpleDefinition {
    constructor(title, field) {
        super(title, field, customStringSorter);
    }
}

/**
 * This class represent a logical column group. It is not associated to an actual
 * column in the dataset, it is only used during table rendering to create a oabels
 * and group columns together
 * @param level Starts at 0
 */
class ColGroupDefinition {
    constructor(title, level) {
        this.title = title;
        // this.level = level;
        this.columns = [];
    }
}

/**
 * Return the title for the totals title
 * @param pivotOptions
 * @returns {string}
 */
function getTotalsTitle(pivotOptions) {
    return `Totals (${pivotOptions.aggregationTotals})`
}

/**
 * TODO
 * @param ar
 * @param e
 * @returns {*}
 */
function getColumnName(ar, e) {
    if (ar !== undefined) {
        if (ar[e] !== undefined) {
            return ar[e];
        }
    }
    return ''
}

/**
 * Return a subset of an array
 * @param {(numeric)[]} positions
 * @param {{key: *[]}} datum
 * @returns {*[]}
 */
function getSlice(positions, datum) {
    let ret = []
    positions.forEach((val) => {
        ret.push(datum.key[val]);
    })
    return ret;
}

/**
 * find the label by property
 * @param {[{value: (numeric|string)[], label: string }]} labels
 * @param {(numeric|string)[]} keyValues
 * @returns {{value: (numeric|string)[], label: string}} The string label if found or values[i] if not found
 */
export function getLabelByProperty(labels, keyVal) {
    if (labels !== undefined && labels[keyVal] !== undefined) {
        return labels[keyVal];
    }
    return keyVal;
}

/**
 * A unidirectional hash map with bucket. The key is an array of simple types
 * ([ 1,'x' ]) and the value is a numerical value representing the position
 * in a collection
 */
export class ColHashMap {

    constructor() {
        this.buckets = {};
        this.length = 0;
    }

    /**
     * Add a new object to the map
     * @param {[]} k A composite key
     */
    add(k) {
        if (this.buckets[k] === undefined) {
            // First time the entry is found no possible collision
            this.buckets[k] = [{key: k, idx: this.length}];
            this.length++;
        } else if (this.get(k) === undefined) {
            // The entry in the hashmap already exists. This is possible when
            // there are hash collision (ex: [1,1] and [ '1,1' ] are converted to
            // '1,1' by javascript.
            // We simply add the new entry to the bucket.
            this.buckets[k].push({key: k, idx: this.length});
            this.length++;
        }
    }

    /**
     * Return the object that correspond to the key passed as argument.
     * @param {[]} k A composite key
     * @return The object is one with the same key exist, undefined otherwise
     */
    get(k) {
        let ar = this.buckets[k];
        if (ar !== undefined) {
            let e = ar.find(v => v.key.every((e, i) => e === k[i]));
            if (e !== undefined) {
                return e;
            }
        }
        return undefined;
    }
}

/**
 * This function will return true if row and column totals has to be
 * calculated when transforming the original data into a pivot data.
 *
 * @param {Options} config
 * @returns {boolean}
 */
function enabledBuiltinTotals(config) {
    return config.enableTotals !== '' && config.aggregationTotals !== '';
}

/**
 * Create the column definition object.
 *
 * @param data
 * @param {Options} config
 * @returns {PivotContext}
 * @private
 */
function _createColDef(data, config) {
    const rows = config.rows;
    const cols = config.cols;
    const header = config.header;
    const labels = config.labels;
    const nRowKey = config.rows.length;
    const pivotContext = new PivotContext();
    const layout = config.layout;
    // Add the column definition for row totals
    const enableAllTotals = (config.enableTotals == OptionEnums.EnableTotals.All);
    const enableRowTotals = enableAllTotals || (config.enableTotals == OptionEnums.EnableTotals.Rows);

    // Collect the key values
    data.forEach((e, i) => {
        let rIds = getSlice(rows, e);
        pivotContext.rowMap.add(rIds);

        let cIds = getSlice(cols, e);
        pivotContext.colMap.add(cIds);
    })


    /**
     * Create the column definition for the columns key (group) and for the rows key (simple)
     */
    let lastCol = pivotContext.colDef;
    let newCol
    let generateColKey = () => cols.forEach( (e, lvl) => {
        newCol = new ColGroupDefinition(getColumnName(header, e), lvl);
        lastCol.push(newCol);
        lastCol = newCol.columns;
    });
    let generateRowKey = () => rows.forEach((e, field) =>
        lastCol.push(Object.assign(new StringColSimpleDefinition(getColumnName(header, e), field), {cssClass: CSS_INTERNALS.pivotHeader}))
    );

    if (layout === 'compact') {
        /**
         * |       RevenueBins     |
         * |        CostBins       |
         * |  RegionBins | AgeBins |
         */
        generateColKey();
        generateRowKey();
    } else {
        /**
         * |                       | RevenueBins |
         * |                       | CostBins    |
         * |  RegionBins | AgeBins |             |
         */
        let rowColGroup;
        rows.forEach((e, i) => {
            let newRowColGroup = new ColGroupDefinition("", i);
            if (rowColGroup!==undefined) {
                rowColGroup.columns.push(newRowColGroup);
            } else {
                lastCol.push(newRowColGroup)
            }
            rowColGroup = newRowColGroup;
        })
        lastCol = rowColGroup.columns;
        generateRowKey();
        lastCol = pivotContext.colDef;
        generateColKey();
        newCol.field = PIVOT_CONST_VALUES.emptyCol
        newCol.cssClass = CSS_INTERNALS.pivotHeader
        newCol.columns = undefined
    }

    let colMap = {};

    /**
     * Extend the column group for columns keys with new column for each possible value of the column keys
     */
    Object.values(pivotContext.colMap.buckets).forEach((e) => {
        e.forEach((v) => {
            let key = v.key;
            let idx = v.idx;
            let pivotDataColId = idx + nRowKey;
            let r = pivotContext.colDef;
            let m = colMap;
            let nColKey = key.length - 1;
            key.forEach((cId, lvl) => {
                if (m[cId] === undefined) {
                    m[cId] = {colId: r.length, next: {}};
                    const myTitle = getLabelByProperty(labels[cols[lvl]], cId);
                    if (lvl < nColKey) {
                        let newCol = new ColGroupDefinition(myTitle, lvl);
                        r.push(newCol);
                        r = newCol.columns;
                    } else {
                        let newCol = new ColSimpleDefinition(myTitle, pivotDataColId)
                        r.push(newCol);
                        r = undefined;
                    }
                } else {
                    // lookup child columns
                    r = r[m[cId].colId].columns;
                }
                m = m[cId].next;
            })
        })
    });

    if (enabledBuiltinTotals(config)) {
        if (enableAllTotals || enableRowTotals) {
            let newCol = new ColSimpleDefinition(`Totals (${config.aggregationTotals})`, PIVOT_CONST_VALUES.totals);
            newCol.cssClass = CSS_INTERNALS.rowFrozen;
            pivotContext.colDef.push(newCol);
        }
    }

    /**
     * Columns definition content is done.
     */
    // FIXME Apply sorting here

    return pivotContext
}

/**
 * The function will compute and add row and column totals. If the
 * corresponding cell already exist (PIVOT_CONST_VALUES.totals) then the
 * value is not calculated/updated and the original value will be
 * kept.
 *
 * For performance reasons, the function does not return anything.
 * The modifications are performed directly on the pivotData object
 * passed as argument.
 *
 * The pivotData argument has the following structure:
 *   [ {'0': 'a', '1': 'x', '2': 1, '3': 2, '4': 2, '5': 2},
 *     {'0': 'b', '1': 'x', '2': 3},
 *     {'0': 'b', '1': 'y',                         '5': 4} ]
 *
 * @param { {}[] } pivotData
 * @param {Options} pivotOptions
 * @param {PivotContext} pivotContext
 */
export function computeTotals(pivotData, pivotOptions, pivotContext) {
    const rows = pivotOptions.rows;
    const nRowKey = rows.length;
    const cols = pivotOptions.cols;
    const nCols = cols.length + nRowKey;
    const totalFun = totalsFun[pivotOptions.aggregationTotals];
    let columnTotals = {};
    let totals = {row: undefined, totalOf: undefined};
    let fTotal = [];
    /**
     * Verify arguments are valid
     */
    /**
     * Prepare aggregation function
     */
    const enableAllTotals = (pivotOptions.enableTotals === OptionEnums.EnableTotals.All);
    const enableRowTotals = (enableAllTotals || pivotOptions.enableTotals === OptionEnums.EnableTotals.Rows);
    const enableColTotals = (enableAllTotals || pivotOptions.enableTotals === OptionEnums.EnableTotals.Cols);
    if (enableRowTotals) {
        // Add row totals
        fTotal.push((v) => totals.row = totalFun(totals.row, v));
    }
    if (enableColTotals) {
        // Add column totals
        fTotal.push((v, i) => columnTotals[i] = totalFun(columnTotals[i], v));
    }
    if (enableAllTotals) {
        // if row and column totals are enabled then we compute rowTotal of totals
        fTotal.push((v) => totals.totalOf = totalFun(totals.totalOf, v));
    }

    if (enableRowTotals || enableColTotals) {
        for (let i = nRowKey; i < nCols; ++i) columnTotals[i] = undefined;
        pivotData.filter(row => row[PIVOT_CONST_VALUES.totals] === undefined)
            .forEach(row => {
                totals.row = undefined;
                for (let k in row) {
                    if (k >= nRowKey) {
                        fTotal.forEach((f) => f(row[k], k));
                    }
                }
                if (enableRowTotals)
                    row[PIVOT_CONST_VALUES.totals] = totals.row; // totals.row;
            })
        if (enableColTotals) {
            if (enableAllTotals) {
                // We also add the totals of totals to the bottom right cell
                columnTotals[PIVOT_CONST_VALUES.totals] = totals.totalOf;
            }

            // Calculate column position based on selected layout. For compact layout
            // the totals label is set on the last column containing the row keys, for
            // the normal layout we use the empty column that contains the column keys.
            let colPos = (pivotOptions.layout=='compact') ? nRowKey - 1 : PIVOT_CONST_VALUES.emptyCol;
            columnTotals[colPos] = getTotalsTitle(pivotOptions);

            columnTotals.cssClass = CSS_INTERNALS.tabulatorCalcsBottom;
            pivotData.push(columnTotals);
        }
    }
}

/**
 * Transform the input table into a pivot table
 *
 * @param {[ {key: [string], value: string|number}]} data The original data in tabular format
 * @param {Options} pivotOptions The configuration that describe how the original table is transformed
 * into a pivot table. This is an immutable object that was passed by the calling context (vdl wrapper).
 * @param {PivotContext} pivotContext This is an object containing information collected during the creation of the
 * column definition. It is used to map the columns from the original dataset into the pivoted table. It
 * is also used to derive/reuse title for the totals row.
 * @returns {[]} The pivot table
 * @private
 */
function _createObject(data, pivotOptions, pivotContext) {
    const rows = pivotOptions.rows;
    const cols = pivotOptions.cols;
    const nRowKey = rows.length;
    const labels = pivotOptions.labels;
    const rowMap = pivotContext.rowMap;
    const colMap = pivotContext.colMap;
    const totalFun = totalsFun[pivotOptions.aggregationValues];

    let pivotData = []
    data.forEach((e, i) => {
        let rowKeys = getSlice(rows, e);
        let colKeys = getSlice(cols, e);
        let rId = rowMap.get(rowKeys).idx;
        let cId = colMap.get(colKeys).idx + nRowKey;
        let value = e.value;
        if (pivotData[rId] === undefined) {
            pivotData[rId] = {};
            rowKeys.forEach((v, i) => {
                pivotData[rId][i] = getLabelByProperty(labels[i], v);
            })
        }
        pivotData[rId][cId] = totalFun(value,pivotData[rId][cId]);
    })

    // if totals are required then we compute them. We don't override totals
    // if they are available from the original data set.
    if (enabledBuiltinTotals(pivotOptions)) {
        computeTotals(pivotData, pivotOptions, pivotContext);
    }

    return pivotData;
}

/** Array based representation of the pivot data. Kept here as reference but
 * not compatible with tabulator.js internal data representation.
 function _createArray(data) {
    const nRowKey =
    // now we are ready to populate the table
    let pivotData = new Array(pivotContext.rowMap.keySet.length);
    for (let i in pivotContext.rowMap.keySet)
        pivotData[i] = new Array(pivotContext.colMap.keySet.length + nRowKey) // also add totals?
    for (let o in data) {
        const rowKey = getSlice(rows,data[o])
        const colKey = getSlice(cols,data[o])
        const rId = pivotContext.rowMap.c[rowKey]
        const cId = pivotContext.colMap.c[colKey][0].idx + nRowKey
        const value = data[o].value;
        for (let i in rowKey) pivotData[rId][i] = rowKey[i]
        pivotData[rId][cId] = value
    }
    // if totals are required then we compute them ...
    if (config.aggregationType) {
        for(let row in pivotData) {
            let total = 0
            for(let i in pivotData[row]) {
                if (i>=nRowKey) {
                    total += pivotData[row][i]
                }
            }
            pivotData[row][PIVOT_CONST_VALUES.totals] = total
        }
    }
    return pivotData
}
 */

function _sanitizeConfig(config) {
    // Set default options
    if (config) {
        // override default fields. Note this is a shallow copy...
        return Object.assign(new Options(), config);
    } else {
        throw Error('Error for pivotDataModule: Configuration is unset.');
    }
}

/**
 *
 * @param data
 * @param {Options} config
 * @returns {{data: [], cols}}
 */
const run = (data, config) => {
    let sanitizedConfig = _sanitizeConfig(config);
    let pivotContext = _createColDef(data, sanitizedConfig);
    let pivotData = _createObject(data, sanitizedConfig, pivotContext);

    return {
        cols: pivotContext.colDef,
        data: pivotData
    }
}

/**
 * Mockable functions
 */
export const pivotDataUtils = {
    isTotalsRowComponent: isTotalsRowComponent,
    getLabelByProperty: getLabelByProperty,
    computeTotals: computeTotals,
    customNumericSorter: customNumericSorter,
    customStringSorter: customStringSorter,
    ColHashMap: ColHashMap
}

/**
 * The API of the module. Mainly used by VDL component
 */
export const pivotDataModule = {
    run: run,
    totalsFun: totalsFun,
    Options: Options,
    OptionEnums: OptionEnums
}
