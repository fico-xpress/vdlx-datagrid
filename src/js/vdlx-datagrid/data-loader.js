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
import { onSubscribe, onSubscriptionDispose } from '../ko-utils';
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
import forEach from 'lodash/forEach';
import pick from 'lodash/pick';
import size from 'lodash/size';

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

    return { defaultScenario: defaultScenario, scenarios: columnsAndScenarios};
}

/**
 *
 * @param {*} config$
 * @returns {{data: KnockoutObservable<{defaultScenario: Scenario, scenarios: Scenario[]}>, errors: KnockoutObservable}}
 */
function withScenarioData(config$, filters$) {
    let hasSubscription = false;
    const scenarios$ = ko.observable([]);

    const scenarioData$ = ko.pureComputed(() => {
        const config = ko.unwrap(config$);
        const scenarios = ko.unwrap(scenarios$);
        if (isEmpty(config) || isEmpty(scenarios)) {
            return undefined;
        }

        return getScenarios(config, scenarios);
    });
    const error$ = ko.observable();

    const scenarioObserver$ = ko.pureComputed(() => {
        const config = ko.unwrap(config$);
        const filters = ko.unwrap(filters$);

        var modelSchema = insight.getView().getApp().getModelSchema();

        if (!isEmpty(config) && !isEmpty(config.scenarioList) && !isEmpty(config.columnOptions)) {
            try {
                error$(undefined);
                var entities = getAutoTableEntities(config.columnOptions);
                var observer = insight.getView().withScenarios(config.scenarioList).withEntities(entities);

                forEach(entities, (entity) => {
                    const indexSets = modelSchema.getEntity(entity).getIndexSets();
                    var filtersForEntity = pick(filters, indexSets);
                    if (size(filtersForEntity)) {
                        observer.filter(entity, () => filtersForEntity);
                    }
                });

                return observer
                    .notify(function (scenarios) {
                        scenarios$(scenarios);
                    })
            } catch (err) {
                debugger
                error$(err);
                return {
                    dispose: noop,
                };
            }
        }
        return undefined;
    });

    const scenarioObserverSubscription$ = ko.pureComputed(function () {
        var scenarioObserver = ko.unwrap(scenarioObserver$);
        return scenarioObserver.start();
    });

    return {
        data: onSubscribe(function (subscription) {
            let subscriptions = [];

            if (!hasSubscription) {
                subscriptions = [
                    scenarioObserver$.subscribe(oldScenarioObserver => {
                        const subscription = scenarioObserverSubscription$();
                        subscription && subscription.dispose();
                    }, null, 'beforeChange'),
                    scenarioObserverSubscription$.subscribe(noop),
                ];
                hasSubscription = true;
            }

            onSubscriptionDispose(function () {
                hasSubscription = !!scenarioData$.getSubscriptionsCount();
                if (!hasSubscription) {
                    const scenarioObserver = scenarioObserverSubscription$();
                    scenarioObserver && scenarioObserver.dispose();
                    each(subscriptions, (sub) => sub.dispose());
                }
            }, subscription);
        }, scenarioData$),
        errors: error$,
    };
}

export default withScenarioData;
