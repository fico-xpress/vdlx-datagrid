/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/data-transform.js
   ```````````````````````
   vdlx-datagrid data transform.

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
import {perf} from '../performance-measurement';
import set from 'lodash/set';
import isFunction from 'lodash/isFunction';
import zipObject from 'lodash/zipObject';
import filter from 'lodash/filter';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import flatMap from 'lodash/flatMap';
import { dataUtils, SelectOptions, createSparseData, createDenseData } from '../insight-modules';

export const getAllColumnIndices = (schema, columnOptions) => {
    return map(columnOptions, function(option) {
        return schema.getEntity(option.name).getIndexSets();
    });
}

const getIndexPosns = dataUtils.getIndexPosns;

/**
 * @typedef {{name: string, position: number}} SetNameAndPosition
 */

/** @returns {SetNameAndPosition[]} */
export const getDisplayIndices = (columnIndices, columnOptions) => {
    var setCount = {};
    var numColumns = columnIndices.length;

    for (var i = 0; i < numColumns; i++) {
        const indices = columnIndices[i],
            options = columnOptions[i];
        const setPosns = getIndexPosns(indices);
        indices.forEach(function(setName, i) {
            const setPosn = setPosns[i];
            if (dataUtils.getFilterValue(options.filters, setName, setPosn) == null) {
                // i.e. if there is no filter, then this index is to be used
                const key = { name: setName, position: setPosn },
                    keyJson = JSON.stringify(key);
                setCount[keyJson] = (setCount[keyJson] || 0) + 1;
            }
        });
    }
    return map(
        keys(
            pickBy(setCount, function(count) {
                return count === numColumns;
            })
        ),
        function(k) {
            return JSON.parse(k);
        }
    );
};

// Build a key from the index set columns of a row. This may be partial, if not all index sets are displayed in the row
export const getPartialExposedKey = (setNameAndPosns, rowData) =>
    // Assume index columns always start at the beginning of the rowData array
    rowData.slice(0, setNameAndPosns.length);

export const generateCompositeKey = function(setValues, setNameAndPosns, arrayIndices, arrayOptions) {
    const setPosns = getIndexPosns(arrayIndices);
    return arrayIndices.map(function(setName, i) {
        const setPosn = setPosns[i];
        const setIndex = findIndex(setNameAndPosns, { name: setName, position: setPosn });
        const filterValue = dataUtils.getFilterValue(arrayOptions.filters, setName, setPosn);
        if (setIndex !== -1) {
            return setValues[setIndex];
        } else if (filterValue != null) {
            return filterValue;
        } else {
            throw Error(
                'Cannot generate table with incomplete index configuration. Missing indices: ' +
                    setName +
                    ' for entity: ' +
                    arrayOptions.name
            );
        }
    });
};

export const createGenerateCompositeKey = setNameAndPosns => {
    const setNameAndPosnsIndices = reduce(
        setNameAndPosns,
        (acc, setNameAndPosn, i) => set(acc, [setNameAndPosn.name, setNameAndPosn.position], i),
        {}
    );

    return (setValues, __, arrayIndices, arrayOptions) => {
        if (isEmpty(arrayOptions.filters)) {
            return setValues;
        }
        const setPosns = getIndexPosns(arrayIndices);
        const result = [];
        for (let i = 0; i < arrayIndices.length; i++) {
            const setName = arrayIndices[i];
            const setPosn = setPosns[i];
            const setIndex = get(setNameAndPosnsIndices, [setName, setPosn]);
            if (setIndex !== undefined) {
                result.push(setValues[setIndex]);
            } else {
                const filterValue = dataUtils.getFilterValue(arrayOptions.filters, setName, setPosn);
                if (filterValue != null) {
                    result.push(filterValue);
                } else {
                    throw Error(
                        'Cannot generate table with incomplete index configuration. Missing indices: ' +
                            setName +
                            ' for entity: ' +
                            arrayOptions.name
                    );
                }
            }
        }

        return result;
    };
};

const isSparse = (sets, arrays) => {
    const totalPossibleKeys = reduce(
        sets,
        function(memo, set) {
            return memo * set.length;
        },
        1
    );

    const totalCountOfArrayValues = reduce(
        arrays,
        function(memo, insightArray) {
            return memo + insightArray.size();
        },
        0
    );

    return totalPossibleKeys * arrays.length >= (totalCountOfArrayValues * Math.log(totalCountOfArrayValues) || 0);
};

export default (allColumnIndices, columns, columnOptions, setNamePosnsAndOptions, scenariosData, rowFilter, rowIndexGenerator) => {
    var defaultScenario = scenariosData.defaultScenario;
    const indexScenarios = uniq(map(map(columnOptions, 'id'), id => get(scenariosData.scenarios, id, defaultScenario)));

    const arrayIds = map(columnOptions, 'id');
    const setIds = map(setNamePosnsAndOptions, 'options.id');

    const arrays = filter(
        map(columnOptions, column => {
            try {
                return get(scenariosData.scenarios, column.id, defaultScenario).getArray(column.name);
            } catch (err) {
                return undefined;
            }
        })
    );

    const sets = map(setNamePosnsAndOptions, setNameAndPosn => {
        return uniq(
          flatMap(indexScenarios, function(scenario) {
            return scenario.getSet(setNameAndPosn.name);
          })
        );
    });

    const schema = insight
        .getView()
        .getApp()
        .getModelSchema();

    const allSetValues = map(setNamePosnsAndOptions, (setNamePosnAndOption, i) => {
        return SelectOptions.generateSelectOptions(schema, indexScenarios, setNamePosnAndOption.name, sets[i], _.get(setNamePosnAndOption, 'options.sortByFormatted'));
    });

    const createRow = values => {
        let row = zipObject(setIds.concat(arrayIds), values);
        row.id = rowIndexGenerator();
        return row;
    };

    if (isEmpty(arrays)) {
        return {
            data: [],
            allSetValues: allSetValues
        };
    }

    let data;
    if (isSparse(sets, arrays)) {
        // assume O(nlogn)
        data = createSparseData(arrays, setNamePosnsAndOptions, allColumnIndices, columnOptions, columns);
    } else {
        data = perf('dense data', () =>
            createDenseData(
                sets,
                arrays,
                setNamePosnsAndOptions,
                allColumnIndices,
                columnOptions,
                createGenerateCompositeKey(setNamePosnsAndOptions)
            )
        );
    }

    // row filtering
    if (isFunction(rowFilter)) {
        data = filter(data, rowData => {
            return rowFilter(rowData, getPartialExposedKey(setNamePosnsAndOptions, rowData));
        });
    }

    return { data: map(data, createRow), allSetValues: allSetValues };
};
