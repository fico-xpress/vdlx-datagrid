/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/data-loader.js
   ```````````````````````
   vdlx-datagrid data loader.

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
import { onSubscribe, onSubscriptionDispose, withDeepEquals } from '../ko-utils';
import fromPairs from 'lodash/fromPairs';
import each from 'lodash/each';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import uniq from 'lodash/uniq';
import identity from 'lodash/identity';
import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import intersection from 'lodash/intersection';
import { get } from 'lodash-es';

function findScenario(scenarios, identifier) {
    var result = null;

    // Find scenario by ID.
    scenarios.some(function (currentScenario) {
        if (currentScenario.getId() === identifier) {
            result = currentScenario;
            return true;
        }
        return false;
    });

    if (result) {
        return result;
    }

    // Find by position.
    scenarios.some(function (currentScenario) {
        if (currentScenario.getSelectionIndex() === identifier) {
            result = currentScenario;
            return true;
        }
        return false;
    });

    return result;
}

function getAutoTableEntities(columnOptions) {
    var modelSchema = insight.getView().getApp().getModelSchema();

    let entities = map(columnOptions, 'name');
    // and index sets
    entities = entities.concat(flatten(map(entities, (entity) => modelSchema.getEntity(entity).getIndexSets())));

    // Also add entities from editor options set.
    entities = entities.concat(filter(map(columnOptions, 'editorOptionsSet'), identity));

    entities = uniq(entities);

    return entities.concat(
        filter(
            map(entities, (entity) => modelSchema.getEntity(entity).getLabelsEntity()),
            identity
        )
    );
}

function getScenarios(config, scenarios) {
    scenarios = [].concat(scenarios);
    const defaultScenario = isUndefined(config.scenario) ? scenarios[0] : findScenario(scenarios, config.scenario);

    // Bind a scenario per column - single table.
    const columnsAndScenarios = fromPairs(
        filter(
            map(config.columnOptions, (currentColumn) => [
                currentColumn.id,
                findScenario(scenarios, currentColumn.scenario),
            ]),
            ([columnId, scenario]) => !!scenario
        )
    );

    return { defaultScenario: defaultScenario, scenarios: columnsAndScenarios };
}

const DataUtils = insightModules.load('utils/data-utils');

const withFilter = (modelSchema, observer, filters, entity) => {
    const indexSets = modelSchema.getEntity(entity).getIndexSets();
    const filtersForEntity = intersection(map(filters, 'setName'), indexSets);

    if (size(filtersForEntity)) {
        observer.filter(entity, () =>
            reduce(
                DataUtils.getFilterPositionsAndValues(filters, DataUtils.getSetNamesAndPosns(indexSets)),
                (memo, filter) => {
                    memo[filter.index] = [].concat(filter.value);
                    return memo;
                },
                {}
            )
        );
    }
    return observer;
};

/**
 *
 * @param {*} config$
 * @returns {{data: KnockoutObservable<{defaultScenario: Scenario, scenarios: Scenario[]}>, errors: KnockoutObservable}}
 */
function withScenarioData(config$, filters$) {
    const view = insight.getView();
    let hasSubscription = false;
    const scenarios$ = ko.observable([]);

    const configForScenarioData$ = withDeepEquals(ko.pureComputed(() => {
        const config = config$();
        return {
            scenario: config.scenario,
            columnOptions: map(config.columnOptions, (options) => ({
                id: options.id,
                scenario: options.scenario,
            })),
        };
    }));

    const scenarioData$ = ko.pureComputed(() => {
        const config = ko.unwrap(configForScenarioData$);
        const scenarios = ko.unwrap(scenarios$);
        if (isEmpty(config) || isEmpty(scenarios)) {
            return scenarioData$.peek();
        }

        return getScenarios(config, scenarios);
    });

    const error$ = ko.observable();

    const scenarioList$ = withDeepEquals(
        ko.pureComputed(() => {
            const config = config$();
            return config.scenarioList || scenarioList$.peek();
        })
    );

    const columnOptions$ = withDeepEquals(
        ko.pureComputed(() => {
            const config = config$();
            return (
                map(config.columnOptions, (options) => ({
                    name: options.name,
                    editorOptionsSet: options.editorOptionsSet,
                })) || columnOptions$.peek()
            );
        })
    );

    const scenarioObserver$ = ko.pureComputed(() => {
        const scenarioList = ko.unwrap(scenarioList$);
        const columnOptions = ko.unwrap(columnOptions$);
        const filters = ko.unwrap(filters$);

        const modelSchema = view.getApp().getModelSchema();

        if (!isEmpty(scenarioList) && !isEmpty(columnOptions) && filters) {
            try {
                error$(undefined);
                const entities = getAutoTableEntities(columnOptions);
                let observer = view.withScenarios(scenarioList).withEntities(entities);
                observer = reduce(
                    uniq(map(columnOptions, 'name')),
                    (observer, entity) => withFilter(modelSchema, observer, filters, entity),
                    observer
                );

                return observer.notify(function (scenarios) {
                    scenarios$(scenarios);
                });
            } catch (err) {
                error$(err);
                return {
                    dispose: noop,
                };
            }
        }
        return scenarioObserver$.peek();
    });

    const scenarioObserverSubscription$ = ko.pureComputed(function () {
        var scenarioObserver = ko.unwrap(scenarioObserver$);
        return scenarioObserver && scenarioObserver.start();
    });

    return {
        data: onSubscribe(function (subscription) {
            let subscriptions = [];

            if (!hasSubscription) {
                subscriptions = [
                    scenarioObserver$.subscribe(
                        () => {
                            const subscription = scenarioObserverSubscription$();
                            subscription && subscription.dispose();
                        },
                        null,
                        'beforeChange'
                    ),
                    scenarioObserverSubscription$.subscribe(noop),
                ];
                hasSubscription = true;
            }

            onSubscriptionDispose(function () {
                hasSubscription = !!scenarioData$.getSubscriptionsCount();
                if (!hasSubscription) {
                    const scenarioObserverSubscription = scenarioObserverSubscription$();
                    scenarioObserverSubscription && scenarioObserverSubscription.dispose();
                    each(subscriptions, (sub) => sub.dispose());
                }
            }, subscription);
        }, scenarioData$),
        errors: error$,
    };
}

export default withScenarioData;
