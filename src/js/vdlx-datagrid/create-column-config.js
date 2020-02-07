import isEmpty from 'lodash/isEmpty';
import range from 'lodash/range';
import has from 'lodash/has';
import omitBy from 'lodash/omitBy';
import isNumber from 'lodash/isNumber';
import forEach from 'lodash/forEach';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import filter from 'lodash/filter';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import overSome from 'lodash/overSome';

const parseIntOrKeep = val => {
    var result = parseInt(val);
    if (isNaN(result)) {
        return val;
    }
    return result;
};

const isNullOrUndefined = overSome([isNull, isUndefined]);

export default (columnConfigs, defaultScenario, tableId) => {
    if (!columnConfigs.length) {
        return { columnOptions: [], indicesOptions: {}, scenarioList: [], calculatedColumnsOptions: [] };
    }

    const entities = [];
    const indices = {};
    const calculatedColumnsOptions = [];
    forEach(columnConfigs, function(configItem) {
        if (configItem.entity || configItem.set) {
            var scenarioNum = parseIntOrKeep(configItem.scenario || defaultScenario);
            configItem = omitBy(configItem, isNullOrUndefined);
            if (isNumber(scenarioNum)) {
                if (scenarioNum < 0) {
                    // reject('Scenario index must be a positive integer.');
                }
            }
            if (!!configItem.entity) {
                configItem.scenario = scenarioNum;
                configItem.name = configItem.entity;
                delete configItem.entity;
                entities.push(configItem);
            } else if (!!configItem.set) {
                configItem.scenario = scenarioNum;
                if (!has(indices, [configItem.set])) {
                    indices[configItem.set] = [];
                }
                const indexList = indices[configItem.set];
                const cleanItem = configItem;
                const setPosn = configItem.setPosition;
                if (setPosn == null) {
                    indexList.push(cleanItem);
                } else if (indexList[setPosn]) {
                    // reject('Table column for set "' + configItem.set + '" at position ' + setPosn
                    //     + ' specified more than once');
                } else {
                    indexList[setPosn] = cleanItem;
                    // if we have increased the length, then need to
                    // explicitly inserts null/undefined here, or some
                    // standard algorithms behave oddly. (E.g. _.map
                    // will count the missing items, but [].map won't)
                    range(indexList.length).forEach(function(j) {
                        if (!indexList[j]) {
                            indexList[j] = null;
                        }
                    });
                }
            }
        } else if (configItem.render) {
            calculatedColumnsOptions.push(configItem);
        }
    });

    const scenarioList = sortBy(
        uniq(
            map(
                filter(entities, item => !isNullOrUndefined(item)),
                item => ko.unwrap(item.scenario)
            )
        )
    );

    if (isEmpty(scenarioList) || isEmpty(entities)) {
        console.debug(`vdl-table (${tableId}): Scenario list or table column configuration is empty, ignoring update`);
    }

    return {
        columnOptions: entities,
        indicesOptions: indices,
        scenarioList: scenarioList,
        calculatedColumnsOptions: calculatedColumnsOptions
    };
};
