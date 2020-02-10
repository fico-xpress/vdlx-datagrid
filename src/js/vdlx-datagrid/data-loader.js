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
import { onSubscribe, onSubscriptionDispose } from './ko-utils';
import fromPairs  from 'lodash/fromPairs';
import each from 'lodash/each';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import uniq from 'lodash/uniq';
import identity from 'lodash/identity';
import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import map from 'lodash/map';

function findScenario(scenarios, identifier) {
    var result = null;

    // Find scenario by ID.
    scenarios.some(function(currentScenario) {
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
    scenarios.some(function(currentScenario) {
        if (currentScenario.getSelectionIndex() === identifier) {
            result = currentScenario;
            return true;
        }
        return false;
    });

    return result;
}

function getAutoTableEntities(columnOptions) {
    var modelSchema = insight
        .getView()
        .getApp()
        .getModelSchema();

    let entities = map(columnOptions, 'name');
    // and index sets
    entities = entities.concat(flatten(map(entities, entity => modelSchema.getEntity(entity).getIndexSets())));

    // Also add entities from editor options set.
    entities = entities.concat(filter(map(columnOptions, 'editorOptionsSet'), identity));

    entities = uniq(entities);

    return entities.concat(filter(map(entities, entity => modelSchema.getEntity(entity).getLabelsEntity()), identity));
}

function getScenarios(config, scenarios) {
    scenarios = [].concat(scenarios);
    const defaultScenario = isUndefined(config.scenario) ? scenarios[0] : findScenario(scenarios, config.scenario);

    // Bind a scenario per column - single table.
    const columnsAndScenarios = fromPairs(
        filter(
            map(config.columnOptions, currentColumn => [
                currentColumn.id,
                findScenario(scenarios, currentColumn.scenario)
            ]),
            ([columnId, scenario]) => !!scenario
        )
    );

    return { defaultScenario: defaultScenario, scenarios: columnsAndScenarios };
}

/**
 *
 * @param {*} config$
 * @returns {{data: KnockoutObservable<{defaultScenario: Scenario, scenarios: Scenario[]}>, errors: KnockoutObservable}}
 */
function withScenarioData(config$) {
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

    const scenarioObserverSubscription$ = ko.pureComputed(function() {
        const config = ko.unwrap(config$);
        if (!isEmpty(config.scenarioList) && !isEmpty(config.columnOptions)) {
            try {
                error$(undefined);
                return insight
                    .getView()
                    .withScenarios(config.scenarioList)
                    .withEntities(getAutoTableEntities(config.columnOptions))
                    .notify(function(scenarios) {
                        scenarios$(scenarios);
                    })
                    .start();
            } catch (err) {
                error$(err);
                return {
                    dispose: noop
                };
            }
        }
        return undefined;
    });

    return {
        data: onSubscribe(function(subscription) {
            let subscriptions = [];

            if (!hasSubscription) {
                subscriptions = [
                    scenarioObserverSubscription$.subscribe(noop),
                    scenarioObserverSubscription$.subscribe(
                        function(oldScenarioObserver) {
                            oldScenarioObserver && oldScenarioObserver.dispose();
                        },
                        null,
                        'beforeChange'
                    )
                ];
                hasSubscription = true;
            }

            onSubscriptionDispose(function() {
                hasSubscription = !!scenarioData$.getSubscriptionsCount();
                if (!hasSubscription) {
                    const scenarioObserver = scenarioObserverSubscription$();
                    scenarioObserver && scenarioObserver.dispose();
                    each(subscriptions, sub => sub.dispose());
                }
            }, subscription);
        }, scenarioData$),
        errors: error$
    };
}

export default withScenarioData;
