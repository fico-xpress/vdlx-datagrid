(function (window) {
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


    /** @constructor */
    function Datagrid (config) {

    }

    Datagrid.prototype.updateConfig = function (config) {
        function updateAutoTable (scenarios) {
            scenarios = [].concat(scenarios);
            var defaultScenario;

            // Bind a scenario per table.
            if (typeof config.scenario !== 'undefined') {
                defaultScenario = findScenario(scenarios, config.scenario);
                if (!defaultScenario) {
                    throw new Error(': Unable to bind AutoTable, scenario ' + config.scenario + ' not found');
                    // MODULE_NAME + ': Unable to bind AutoTable, scenario ' + config.scenario + ' not found');
                }
            } else {
                defaultScenario = scenarios[0];
            }
            // Bind a scenario per column - single table.
            config.columnOptions.forEach(function (currentColumn) {
                if (currentColumn.scenario === undefined) {
                    return;
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
                    throw new Error(': Unable to bind AutoTable, scenario ' + scenarioIdOrIndex + ' not found');
                }

                currentColumn.scenario = scenario;
            });

            var autoTableOptions = _.extend({}, config, { scenario: defaultScenario });
        }

        insight.getView()
            .withScenarios(config.scenarioList)
            .withEntities(getAutoTableEntities(config.columnOptions))
            .notify(updateAutoTable)
            .start();
    };

    window.DATAGRID = _.assign({}, window.DATAGRID, { datagrid: Datagrid });
})(window);