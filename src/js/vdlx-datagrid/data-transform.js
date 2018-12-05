const DataUtils = insightModules.load('utils/data-utils');
const createDenseData = insightModules.load('components/table/create-dense-data');

const getAllColumnIndices = (schema, columnOptions) => {
    return columnOptions.map(function (option) {
        return schema.getEntity(option.name).getIndexSets();
    });
};

const getDisplayIndices = (columnIndices, columnOptions) => {
    var setCount = {};
    var numColumns = columnIndices.length;

    for (var i = 0; i < numColumns; i++) {
        const indices = columnIndices[i], options = columnOptions[i];
        const setPosns = DataUtils.getIndexPosns(indices);
        indices.forEach(function (setName, i) {
            const setPosn = setPosns[i];
            if (DataUtils.getFilterValue(options.filters, setName, setPosn) == null) {
                // i.e. if there is no filter, then this index is to be used
                const key = { name: setName, position: setPosn }, keyJson = JSON.stringify(key);
                setCount[keyJson] = (setCount[keyJson] || 0) + 1;
            }
        });
    }

    return _(setCount)
        .pick(function (count) {
            return count === numColumns;
        })
        .keys()
        .map(function (k) {
            return JSON.parse(k);
        })
        .value();

}
// Build a key from the index set columns of a row. This may be partial, if not all index sets are displayed in the row
const getPartialExposedKey = function (setNameAndPosns, rowData) {
    // Assume index columns always start at the beginning of the rowData array
    return rowData.slice(0, setNameAndPosns.length);
};

const generateCompositeKey = function (setValues, setNameAndPosns, arrayIndices, arrayOptions) {
    const setPosns = DataUtils.getIndexPosns(arrayIndices);
    return arrayIndices.map(function (setName, i) {
        const setPosn = setPosns[i];
        const setIndex = _.findIndex(setNameAndPosns, { name: setName, position: setPosn });
        const filterValue = DataUtils.getFilterValue(arrayOptions.filters, setName, setPosn);
        if (setIndex !== -1) {
            return setValues[setIndex];
        } else if (filterValue != null) {
            return filterValue;
        } else {
            throw Error('Cannot generate table with incomplete index configuration. Missing indices: ' +
                setName + ' for entity: ' + arrayOptions.name);
        }
    });
};


export default (config) => {
    var schema = insight.getView().getProject().getModelSchema();
    var columnOptions = config.columnOptions || [];
    var defaultScenario = config.scenario;

    /** @type {string[][]} */
    var columnIndices = getAllColumnIndices(schema, columnOptions);

    /** @type {AutoTable~SetNameAndPosition} */
    var setNameAndPosns = getDisplayIndices(columnIndices, columnOptions);

    var indexScenarios = _(columnOptions)
        .map('scenario')
        .map(function (scenario) {
            // Columns with no scenario specified use the default scenario
            return scenario || defaultScenario;
        })
        .uniq()
        .value();

    const arrayNames = _.map(columnOptions, 'name');
    const arrays = _.map(columnOptions, (column) => column.scenario.getArray(column.name));

    const setNames = _.map(setNameAndPosns, 'name');
    const sets = _.map(setNameAndPosns, setNameAndPosn => {
        return _(indexScenarios) 
            .map(function (scenario) {
                return scenario.getSet(setNameAndPosn.name);
            })
            .flatten()
            .uniq()
            .value();
    });

    const createRow = _.partial(_.zipObject, setNames.concat(arrayNames));

    return _.map(createDenseData(sets, arrays, setNameAndPosns, columnIndices, columnOptions, generateCompositeKey), createRow);
};