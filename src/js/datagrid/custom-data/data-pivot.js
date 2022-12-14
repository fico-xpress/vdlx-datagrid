const _ = require('lodash');

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
const constValues = {totals: "__totals"}

const cssInternals = {pivotHeader: "pivot-row-header"}

function isValue(a) {
    return a!==undefined && a!==null
}
function isNumber(a) {
    return isValue(a) && !isNaN(a)
}
function _countIfNotEmpty(a) {
    return isNumber(a) ? 1 : 0
}

/**
 * The map of functions that can be used when calculating
 * aggregated values
 * @type {{min: (function(*, *): *), max: (function(*, *): *), count: (function(*, *): *), sum: (function(*, *): *)}}
 */
export const totalsFun = {
    "sum":   (a, b) => (isNumber(b)) ? (isNumber(a)) ? a + b : b : a,
    "min":   (a, b) => (isNumber(b)) ? (isNumber(a)) ? ((a <= b) ? a : b) : b : a,
    "max":   (a, b) => (isNumber(b)) ? (isNumber(a)) ? ((a >= b) ? a : b) : b : a,
    "count": (a, b) => (isValue(b))  ? isNumber(a)   ? a + _countIfNotEmpty(b) : _countIfNotEmpty(b) : a
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
        Rows: 'rows',
        Cols: 'cols',
        None: ''
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
    constructor() {
        /**
         * The aggregation function that is used to calculate the rows and columns
         * totals.
         * @type {string}
         */
        this.aggregationType = OptionEnums.AggregationTypes.Count

        /**
         * The totals
         * See OptionEnums.EnableTotals for available options
         */
        this.enableTotals = OptionEnums.EnableTotals.All

        /** @type {(numeric)[]} */
        this.rows = []
        /** @type {(numeric)[]} */
        this.cols = []
        this.labels = []
        /** @type {(string)[]} */
        this.header = []
    }
}

export class PivotContext {
    constructor() {
        this.colDef = {}
        this.rowMap = new ColHashMap()
        this.colMap = new ColHashMap()
        this.colDef = []
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

 * The "number as string" format is a constraint of vdlx-data-grid OR tabulator.js (to be
 * determined). While this format might not be the best from a memory consumption perspective
 * (storing object VS storing array values) it might offer faster rendering time.
 *
 */
class ColSimpleDefinition {
    constructor(title, field) {
        // Column name
        this.title = title
        // Column index in the original data set
        // Tabulator expects the field to be a string because of "nested field" feature
        this.field = field.toString()
        // Aggregation function used for bottom total
        // this.bottomCalc = ""
        // A CSS class to use for the labels
        // this.cssClass = ""
    }
}

/**
 * This class represent a logical column group. It is not associated to an actual
 * column in the dataset, it is only used during table rendering to create a oabels
 * and group columns together
 */
class ColGroupDefinition {
    constructor(title, level) {
        this.title = title
        this.level = level
        this.columns = []
    }
}

/**
 * TODO
 * @param ar
 * @param e
 * @returns {*}
 */
function getColumnName(ar,e) {
    if (ar !== undefined ) {
        if (ar[e] !== undefined) {
            return ar[e]
        }
    }
    return e
}

/**
 * Return a subset of an array
 * @param {(number)[]} ar
 * @param {{key: *[]}} e
 * @returns {*[]}
 */
function getSlice(ar, e) {
    let ret = []
    ar.forEach( (i) => {
        ret.push(e.key[i])
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
    if (labels!==undefined && labels[keyVal]!==undefined) {
        return labels[keyVal]
    }
    return keyVal
}

/**
 * A unidirectional hash map with bucket. The key is an array of simple types
 * ([ 1,"x" ]) and the value is a numerical value representing the position
 * in a collection
 */
export class ColHashMap {

    constructor() {
        this.buckets = {}
        this.length = 0
    }

    /**
     * Add a new object to the map
     * @param {[]} k A composite key
     */
    add(k) {
        if (this.buckets[k] === undefined) {
            // First time the entry is found no possible collision
            this.buckets[k] = [{key: k, idx: this.length}]
            this.length++
        } else if (this.get(k) === undefined) {
            // The entry in the hashmap already exists. This is possible when
            // there are hash collision (ex: [1,1] and [ "1,1" ] are converted to
            // "1,1" by javascript.
            // We simply add the new entry to the bucket.
            this.buckets[k].push({key: k, idx: this.length})
            this.length++
        }
    }

    /**
     * Return the object that correspond to the key passed as argument.
     * @param {[]} k A composite key
     * @return The object is one with the same key exist, undefined otherwise
     */
    get(k) {
        let ar = this.buckets[k]
        if (ar !== undefined ) {
            let e = ar.find( v => v.key.every((e,i) => e === k[i]) )
            if (e !== undefined) {
                return e
            }
        }
        return undefined
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
    return config.enableTotals !== '' && config.aggregationType !== ''
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
    const rows = config.rows
    const cols = config.cols
    const header = config.header;
    const labels = config.labels;
    const nRowKey = config.rows.length;
    const pivotContext = new PivotContext();

    // Collect the key values
    data.forEach( (e,i) => {
        let rIds = getSlice(rows,e)
        pivotContext.rowMap.add(rIds)

        let cIds = getSlice(cols,e)
        pivotContext.colMap.add(cIds)
    })


    /**
     * Create the column definition for the columns key (group) and for the rows key (simple)
     */
    let lastCol = pivotContext.colDef
    cols.forEach( (e,lvl) => {
        let newCol = new ColGroupDefinition(getColumnName(header,e), lvl)
        lastCol.push(newCol)
        lastCol = newCol.columns;
    })

    rows.forEach( (e,field) =>
        // first time we hit this value for the column, let's store it
        lastCol.push( Object.assign( new ColSimpleDefinition(getColumnName(header,e), field), { cssClass: cssInternals.pivotHeader } ) )
    )

    let colMap = {}

    /**
     * Extend the column group for columns keys with new column for each possible value of the column keys
     */
    Object.values(pivotContext.colMap.buckets).forEach((e) => {
        e.forEach( (v) => {
            let key = v.key
            let idx = v.idx
            let pivotDataColId = idx + nRowKey
            let r = pivotContext.colDef
            let m = colMap
            let nColKey = key.length - 1
            key.forEach((cId,lvl) => {
                if (m[cId] === undefined) {
                    m[cId] = {colId: r.length, next: {}}
                    const myTitle = getLabelByProperty(labels[cols[lvl]],cId)
                    if (lvl < nColKey) {
                        let newCol = new ColGroupDefinition(myTitle,lvl)
                        r.push(newCol)
                        r = newCol.columns
                    } else {
                        let newCol = new ColSimpleDefinition(myTitle,pivotDataColId)
                        r.push(newCol)
                        r = undefined
                    }
                } else {
                    // lookup child columns
                    r = r[m[cId].colId].columns
                }
                m = m[cId].next
            })
        })
    })

    // Add the column definition for row totals
    if (enabledBuiltinTotals(config) && (config.enableTotals == OptionEnums.EnableTotals.All || config.enableTotals == OptionEnums.EnableTotals.Rows )) {
        let newCol = new ColSimpleDefinition(`Totals (${config.aggregationType})`, constValues.totals);
        newCol.cssClass = "tabulator-frozen"
        pivotContext.colDef.push(newCol)
    }

    /**
     * Columns definition content is done.
     */
    // TODO Apply sorting here

    return pivotContext
}

export function computeTotals(pivotData, pivotOptions, pivotContext) {
    const rows = pivotOptions.rows
    const nRowKey = rows.length
    const colDef = pivotContext.colDef
    const totalFun = totalsFun[pivotOptions.aggregationType];
    const nCols = pivotContext.colMap.length + nRowKey
    let columnTotals = {}
    let totals = {row: undefined, totalOf: undefined}
    let hasColTotals = false
    let hasRowTotals = false
    let fTotal = []
    if (pivotOptions.enableTotals == OptionEnums.EnableTotals.All || pivotOptions.enableTotals == OptionEnums.EnableTotals.Rows) {
        // Add row totals
        hasRowTotals = true
        fTotal.push((v) => totals.row = totalFun(totals.row, v))
    }
    if (pivotOptions.enableTotals == OptionEnums.EnableTotals.All || pivotOptions.enableTotals == OptionEnums.EnableTotals.Cols) {
        // Add column totals
        hasColTotals = true
        fTotal.push((v, i) => columnTotals[i] = totalFun(columnTotals[i], v))
    }
    if (pivotOptions.enableTotals == OptionEnums.EnableTotals.All) {
        // if row and column totals are enabled then we compute rowTotal of totals
        fTotal.push((v) => totals.totalOf = totalFun(totals.totalOf, v))
    }

    if (hasRowTotals || hasColTotals) {
        for (let i = nRowKey; i < nCols; ++i) columnTotals[i] = undefined
        pivotData.filter(row => row[constValues.totals] === undefined)
            .forEach(row => {
                totals.row = undefined
                for (let i = nRowKey; i < nCols; ++i) fTotal.forEach((f) => f(row[i], i))
                if (hasRowTotals)
                    row[constValues.totals] = totals.row // totals.row
            })
        if (hasColTotals) {
            if (colDef[colDef.length - 1] !== undefined && colDef[colDef.length - 1].title !== undefined)
                columnTotals[nRowKey - 1] = colDef[colDef.length - 1].title
            if (hasRowTotals) {
                columnTotals[constValues.totals] = totals.totalOf
            }
            columnTotals.cssClass = "tabulator-calcs-bottom"
            pivotData.push(columnTotals)
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
    const rows = pivotOptions.rows
    const cols = pivotOptions.cols
    const nRowKey = rows.length
    const labels = pivotOptions.labels
    const rowMap = pivotContext.rowMap
    const colMap = pivotContext.colMap

    let pivotData = []
    data.forEach( (e,i) => {
        let rowKeys = getSlice(rows,e)
        let colKeys = getSlice(cols,e)
        let rId = rowMap.get(rowKeys).idx
        let cId = colMap.get(colKeys).idx + nRowKey
        let value = e.value;
        if (pivotData[rId] === undefined) {
            pivotData[rId] = {}
            rowKeys.forEach( (v,i) => {
                pivotData[rId][i] = getLabelByProperty(labels[i], v)
            })
        }
        pivotData[rId][cId] = value
    })

    // if totals are required then we compute them. We don't override totals
    // if they are available from the original data set.
    if (enabledBuiltinTotals(pivotOptions)) {
        computeTotals(pivotData, pivotOptions, pivotContext);
    }

    return pivotData
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
            pivotData[row][constValues.totals] = total
        }
    }
    return pivotData
}
 */

function _sanitizeConfig(config) {
    // Set default options
    if (config) {
        // override default fields. Note this is a shallow copy...
        return Object.assign(new Options(), config)
    } else {
        error("Configuration is unset. I don't know what to do...")
    }
    return config
}

/**
 *
 * @param data
 * @param {Options} config
 * @returns {{data: [], cols}}
 */
const run = (data, config) => {
    let sanitizedConfig = _sanitizeConfig(config);
    let pivotContext = _createColDef(data,sanitizedConfig)
    let pivotData  = _createObject(data,sanitizedConfig,pivotContext)

    return {
        cols: pivotContext.colDef,
        data: pivotData
    }
}

export const pivotDataModule = {
    run: run,
    totalsFun: totalsFun,
    Options: Options,
    OptionEnums: OptionEnums
}
