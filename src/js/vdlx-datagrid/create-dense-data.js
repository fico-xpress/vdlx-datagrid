import perf from '../performance-measurement';

const cartesianProduct = sets =>
    _.reduce(sets, (acc, set) => _.flatten(_.map(acc, x => _.map(set, y => [...x, y]))), [[]]);

export default function createTableData (sets, arrays, setNameAndPosns, columnIndices, columnOptions, generateCompositeKey) {
    const tuples = perf('PERF cartesian product: ', () => cartesianProduct(sets));
    return _.filter(_.map(tuples, (tuple) => {
        let values = [];
        for(let j = 0; j < arrays.length; j++) {
            let compositeKey = tuple;
            if (!_.isEmpty(columnOptions[j].filters)) {
                compositeKey = generateCompositeKey(tuple, setNameAndPosns, columnIndices[j], columnOptions[j]);
            }
            let value = arrays[j].getValue(compositeKey);
            if (value == null) {
                return undefined;
            }
            value = value == null ? '' : value;
            values.push(value)
        }

        return tuple.concat(values);
    }));
};