import { onSubscribe, onSubscriptionDispose, combineLatest, filter, map } from "./ko-utils";

function findScenario (scenarios, identifier) {
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

function getAutoTableEntities (columnOptions) {
    var modelSchema = insight.getView().getProject().getModelSchema();

    let entities = _.map(columnOptions, 'name');
    // and index sets
    entities = entities.concat(
        _.flatten(_.map(entities, entity => modelSchema.getEntity(entity).getIndexSets()))
    );

    // Also add entities from editor options set.
    entities = entities.concat(
        _.filter(_.map(columnOptions, 'editorOptionsSet'), _.identity)
    );

    entities = _.uniq(entities);

    return entities.concat(
        _.filter(_.map(entities, (entity) => modelSchema.getEntity(entity).getLabelsEntity()), _.identity)
    );
}

function getScenarios (config, scenarios) {
    scenarios = [].concat(scenarios);
    const defaultScenario = _.isUndefined(config.scenario) ? scenarios[0] : findScenario(scenarios, config.scenario);

    // Bind a scenario per column - single table.
    const columnsAndScenarios = _.zipObject(_.filter(_.map(config.columnOptions, currentColumn => [
        currentColumn.id,
        findScenario(scenarios, currentColumn.scenario)
    ]), ([columnId, scenario]) => !!scenario));

    return { defaultScenario: defaultScenario, scenarios: columnsAndScenarios };
}

/**
 *
 * @param {*} config$
 * @returns {KnockoutObservable<{defaultScenario: Scenario, scenarios: Scenario[]}>}
 */
function withScenarioData (config$) {
    let hasSubscription = false;
    const scenarios$ = ko.observable([]);

    const scenarioData$ = ko.pureComputed(() => {
        const config = ko.unwrap(config$);
        const scenarios = ko.unwrap(scenarios$);
        if (_.isEmpty(config) || _.isEmpty(scenarios)) {
            return undefined;
        }

        return getScenarios(config, scenarios);
    });

    const scenarioObserverSubscription$ = ko.pureComputed(function () {
        const config = ko.unwrap(config$);
        if (!_.isEmpty(config.scenarioList) && !_.isEmpty(config.columnOptions)) {
            return insight.getView()
                .withScenarios(config.scenarioList)
                .withEntities(getAutoTableEntities(config.columnOptions))
                .notify(function (scenarios) {
                    scenarios$(scenarios);
                })
                .start();
        }
        return undefined;
    });

    return onSubscribe(function (subscription) {
        let subscriptions = [];

        if (!hasSubscription) {
            subscriptions = [scenarioObserverSubscription$.subscribe(_.noop),
            scenarioObserverSubscription$.subscribe(function (oldScenarioObserver) {
                oldScenarioObserver && oldScenarioObserver.dispose();
            }, null, 'beforeChange')];
            hasSubscription = true;
        }

        onSubscriptionDispose(function () {
            hasSubscription = !!scenarioData$.getSubscriptionsCount();
            if (!hasSubscription) {
                _.each(subscriptions, sub => sub.dispose());
            }
        }, subscription);

    }, scenarioData$);
};

export default withScenarioData;
