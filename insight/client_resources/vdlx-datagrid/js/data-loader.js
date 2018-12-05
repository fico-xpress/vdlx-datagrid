(function (window) {
    console.log('data-loader');

    var onSubscribe = _.curry(function (f, observable) {
        var subscribe = observable.subscribe;
        observable.subscribe = function () {
            var subscription = subscribe.apply(observable, arguments);
            f(subscription);
            return subscription;
        };

        return observable;
    }, 2);

    function onSubscriptionDispose(f, subscription) {
        var dispose = subscription.dispose;

        subscription.dispose = function () {
            dispose.apply(subscription, arguments);
            f();
        };

        return subscription;
    }

    /**
     * Lookup a scenario by index or id.
     *
     * @param {Array.<Scenario>} scenarios list of available scenarios
     * @param {(number|string)} identifier either scenario index or id to look up
     * @returns {Scenario} the matching scenario
     */
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

    function getLabelsEntity (entityName) {
        var modelSchema = insight.getView().getProject().getModelSchema();
        return modelSchema.getEntity(entityName).getLabelsEntity();
    }

    function getAutoTableEntities (columnOptions) {
        var modelSchema = insight.getView().getProject().getModelSchema();

        var entities = columnOptions
            .map(function (column) {
                return column.name;
            })
            .reduce(function (memo, current) {
                memo.push(current);
                return memo.concat(modelSchema.getEntity(current).getIndexSets());
            }, []);

        // Also add entities from editor options set.
        entities = columnOptions
            .filter(function (column) {
                return column.editorOptionsSet;
            })
            .map(function (column) {
                return column.editorOptionsSet;
            })
            .reduce(function (memo, current) {
                return memo.concat(current);
            }, entities);

        entities = _.uniq(entities);

        return entities.concat(entities.map(getLabelsEntity).filter(_.identity));
    }

    function updateAutoTable (config, scenarios) {
        scenarios = [].concat(scenarios);
        var defaultScenario;

        // Bind a scenario per table.
        if (typeof config.scenario !== 'undefined') {
            defaultScenario = findScenario(scenarios, config.scenario);
            if (!defaultScenario) {
                // return config;
                // throw new Error(': Unable to bind AutoTable, scenario ' + config.scenario + ' not found');
                // MODULE_NAME + ': Unable to bind AutoTable, scenario ' + config.scenario + ' not found');
            }
        } else {
            defaultScenario = scenarios[0];
        }

        // Bind a scenario per column - single table.
        config.columnOptions = _.map(config.columnOptions, function (currentColumn) {
            if (currentColumn.scenario === undefined) {
                return currentColumn;
            }

            var scenarioIdOrIndex;
            if (typeof currentColumn.scenario === 'object') {
                scenarioIdOrIndex = currentColumn.scenario.getId();
            } else {
                // The user initially passes the scenario ID or index; we then overwrite it with the scenario.
                scenarioIdOrIndex = currentColumn.scenario;
            }

            var scenario = findScenario(scenarios, scenarioIdOrIndex);

            if (!scenario) {
                return currentColumn;
                // throw new Error(': Unable to bind AutoTable, scenario ' + scenarioIdOrIndex + ' not found');
            }

            return _.assign(currentColumn, {scenario: scenario});
        });

        var autoTableOptions = _.extend({}, config, { scenario: defaultScenario });

        return autoTableOptions;
    }

    function withData (config$) {

        let hasSubscription = false;
        const scenarios$ = ko.observable([]);

        const configWithData$ = ko.pureComputed(function () {
            const scenarios = ko.unwrap(scenarios$);
            const config = ko.unwrap(config$);
            if (!_.isEmpty(config) && !_.isEmpty(scenarios)) {
                return updateAutoTable(ko.unwrap(config$), ko.unwrap(scenarios$));
            }
            return undefined;
        });

        const scenarioObserverSubscription$ = ko.pureComputed(function () {
            let config = ko.unwrap(config$);
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
                hasSubscription = !!configWithData$.getSubscriptionsCount();
                if (!hasSubscription) {
                    _.each(subscriptions, function (sub) { sub.dispose(); });
                }
            }, subscription);

        }, configWithData$);
    };

    window.DATAGRID = _.assign({}, window.DATAGRID, { withData: withData });

})(window);