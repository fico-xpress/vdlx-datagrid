const COLUMN_UPDATE_DELAY = 100;

function parseIntOrKeep (val) {
    var result = _.parseInt(val);
    if (_.isNaN(result)) {
        return val;
    }
    return result;
}

function isNullOrUndefined (val) {
    return _.isNull(val) || _.isUndefined(val);
}

export default function (params, componentInfo) {
    const view = insight.getView();

    var vm = {};
    // debugger;
    vm.columnConfig = [];

    if (params.width) {
        vm.tableWidth = params.width.replace('px', '');
    }

    const element = componentInfo.element;

    const defaultScenario = params.scenarioId || 0;

    const pageMode = params.pageMode;
    const gridHeight = ko.unwrap(params.gridHeight);

    function buildTable () {
        var groupOpen = 'true';

        var tableOptions = {
            columns: vm.columnConfig,
            layout: 'fitColumns',
            // height: '600px',
            placeholder: 'Waiting for data',
            // groupBy: groupBy,
            groupStartOpen: groupOpen === 'true',
            ajaxLoader: true // ???
        };

        const datagridConfig = $(element)
            .find('vdlx-datagrid-column')
            .map(function (idx, element) {
                return _.clone(element['autotableConfig']);
            });

        var entities = [];
        var indices = {};

        _.forEach(datagridConfig, function (configItem) {
            var scenarioNum = parseIntOrKeep(configItem.scenario || defaultScenario);
            if (_.isNumber(scenarioNum)) {
                if (scenarioNum < 0) {
                    // reject('Scenario index must be a positive integer.');
                }
            }
            configItem.scenario = scenarioNum;
            if (!!configItem.entity) {
                configItem.name = configItem.entity;
                delete configItem.entity;
                entities.push(_.omit(configItem, isNullOrUndefined));
            } else if (!!configItem.set) {
                if (!_.has(indices, [configItem.set])) {
                    indices[configItem.set] = [];
                }
                const indexList = indices[configItem.set];
                const cleanItem = _.omit(configItem, isNullOrUndefined);
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
                    _.range(indexList.length).forEach(function (j) {
                        if (!indexList[j]) {
                            indexList[j] = null;
                        }
                    });
                }
            } else {
                // reject('Unknown column type');
            }
        });

        console.log(indices, entities);

        tableOptions.columns = _.flatten(
            _.map(indices, (setArray, setName) => {
                return _.map(setArray, (setObject, setPosition) => {
                    return _.assign(setObject, { title: setObject.set, field: setObject.set, setPosition: setPosition });
                });
            })
        );

        tableOptions.columns = tableOptions.columns.concat(
            _.map(entities, entity => _.assign(entity, { title: entity.name, field: entity.name }))
        );

        vm.table = new Tabulator('#' + params.tableId, tableOptions);

        vm.table
            .setData(params.gridData)
            .then(function () {
                vm.table.redraw();
            })
            .catch(function (err) {
                debugger;
            });
    }

    const throttledBuildTable = _.throttle(buildTable, COLUMN_UPDATE_DELAY, { leading: false });

    vm.tableUpdate = function () {
        throttledBuildTable();
    };

    vm.tableValidate = function () {
        debugger;
    };

    vm.validate = function () {
        debugger;
    };

    buildTable();

    return vm;
}