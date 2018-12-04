const COLUMN_UPDATE_DELAY = 100;

const VXDAttributes = [
    {
        name: 'id',
        description: 'Specify an element id for the table. Useful if you later want to target the table using a selector. ' +
        'If not given then an id will be generated.'
    },
    {
        name: 'scenario',
        description: 'The default scenario to use for fetching data in the table. This can be overridden per column but the default ' +
        'will be used when a column does not specify a particular scenario and the index sets will be fetched from the default scenario.',
        acceptsExpression: true
    },
    {
        name: 'page-size',
        description: 'The number of rows to show per-page in paged mode. Defaults to 50.',
        acceptsExpression: true
    },
    {
        name: 'page-mode',
        description: 'By default the table will show all rows. Set this attribute to "paged" to enable table pagination.'
    },
    {
        name: 'height',
        description: 'Table height'
    },
    {
        name: 'show-filter',
        description: 'Set this to "true" to enable the table filter. This will show a single input above the table to filter across all table cells.'
    },
    {
        name: 'column-filter',
        description: 'Set this to "true" to enable the column filters. This will show a header row with filter inputs for each column.'
    },
    {
        name: 'add-remove-row',
        description: 'Setting this will show the add-remove row buttons at the bottom of the table. Set to "true" ' +
        'to prompt for index selection on row add. Set to "addrow-autoinc" will switch the behaviour to allow new ' +
        'index values to be created, incrementing from the highest value in the set(s).'
    },
    {
        name: 'selection-navigation',
        description: 'Enable/disable table navigation, selection and clipboard features. Set to "false" to disable ' +
        'these features. Defaults to true.'
    },
    {
        name: 'modifier',
        description: 'Table modifier function. Will be called after the table configuration ' +
        'has been built. Provides a way to change the configuration before the table is rendered. Must ' +
        'be an expression that resolves to a function. Takes the table configuration object and ' +
        'should return the modified configuration. If an object is not returned then the table will be unaffected.',
        acceptsExpression: true
    },
    {
        name: 'width',
        description: 'Set the table to a fixed width, in pixels. Accepts an integer value. ' +
        'If set to the string "custom" then the table width is calculated by adding up all the widths of the columns in the table. ' +
        'If a column doesn\'t have a width specified then it is given a default value of 100px.',
        acceptsExpression: false
    },
    {
        name: 'class',
        description: 'Space-separated list of the classes of the element.',
        acceptsExpression: false
    },
    {
        name: 'always-show-selection',
        description: 'Whether to display selection on inactive tables. Set to "true" to keep selection on a table when it becomes inactive. Defaults to false.',
        acceptsExpression: false
    },
    {
        name: 'row-filter',
        description: 'Expression to be used for filtering the rows of a <vdl-table>. This must be an expression and ' +
        'should resolve to either a function or a boolean value. If a function it will be executed when table updates. ' +
        'The function will have the following signature (rowData, indices) and should return a boolean.',
        acceptsExpression: true,
        required: false,
        expressionVars: [
            {
                name: 'rowData',
                type: 'Array.<(string|boolean|number)>',
                description: 'Data for all row cells'
            },
            {
                name: 'indices',
                type: 'Array.<(string|boolean|number)>',
                description: 'Data for the index columns of the row'
            }
        ]
    },
    {
        name: 'save-state',
        description: 'Set this to "false" to disable table state saving. By default table state is stored in the ' +
        "user's browser session so that user settings (e.g. page, sorting and search) are preserved if table data " +
        'is reloaded. Defaults to true.',
        acceptsExpression: false,
        required: false
    },
    {
        name: 'grid-data',
        acceptsExpression: true,
    }
];

function parseIntOrKeep(val) {
    var result = _.parseInt(val);
    if (_.isNaN(result)) {
        return val;
    }
    return result;
}

function isNullOrUndefined(val) {
    return _.isNull(val) || _.isUndefined(val);
}

VDL('vdlx-datagrid', {
    tag: 'vdlx-datagrid',
    attributes: VXDAttributes,
    createViewModel: function (params, componentInfo) {
        const view = insight.getView();

        var vm = {};
        // debugger;
        vm.columnConfig = [];

        if (params.width) {
            vm.tableWidth = params.width.replace('px', '');
        }

        const element = componentInfo.element;

        const defaultScenario = params.scenarioId || 0;

        function buildTable() {

            var groupOpen = 'true';

            var tableOptions = {
                columns: vm.columnConfig,
                layout: "fitColumns",
                height: '600px',
                placeholder: 'Waiting for data',
                // groupBy: groupBy,
                groupStartOpen: groupOpen === 'true',
                ajaxLoader: true, // ???
            };



            const datagridConfig = $(element).find('vdlx-datagrid-column').map(function (idx, element) {
                return _.clone(element['autotableConfig']);
            });

            var entities = [];
            var indices = {};

            _.forEach(datagridConfig, (function (configItem) {
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
            }));

            console.log(indices, entities);

            tableOptions.columns = _.flatten(_.map(indices, (setArray, setName)=> {
                return _.map(setArray, (setObject, setPosition) => {
                    return _.assign(setObject, {title: setObject.set, field: setObject.set, setPosition: setPosition});
                })
            }));

            tableOptions.columns = tableOptions.columns.concat(_.map(entities, (entity) => _.assign(entity, {title: entity.name, field: entity.name})));

            vm.table = new Tabulator('#' + params.tableId, tableOptions);

            vm.table.setData(params.gridData)
                .then(function () {
                    vm.table.redraw();
                })
                .catch(function (err) {
                    debugger;
                });
        }

        const throttledBuildTable = _.throttle(
                buildTable,
                COLUMN_UPDATE_DELAY,
                {leading: false});

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
    },
    transform: function (element, attributes, api) {

        var paramsBuilder = api.getComponentParamsBuilder(element);
        var $element = $(element);

        var scenarioId = attributes['scenario'];
        if (scenarioId) {
            if (scenarioId.expression.isString) {
                var parsedNum = parseInt(scenarioId.rawValue);
                if (isNaN(parsedNum)) {
                    paramsBuilder.addParam('scenarioId', scenarioId.rawValue);
                } else {
                    if (parsedNum < 0) {
                        throw Error('If scenario-id is specifying an index it must be a positive integer.');
                    }
                    paramsBuilder.addParam('scenarioId', parsedNum);
                }
            } else {
                paramsBuilder.addParam('scenarioId', scenarioId.expression.value, true);
            }
        }

        var pageSize = attributes['page-size'];
        if (pageSize) {
            if (pageSize.expression.isString) {
                var pageSizeNum = parseInt(pageSize.rawValue);
                if (!isNaN(pageSizeNum)) {
                    paramsBuilder.addParam('pageSize', pageSizeNum);
                }
            } else {
                paramsBuilder.addParam('pageSize', pageSize.expression.value, true);
            }
        }

        var pageMode = attributes['page-mode'];
        if (pageMode) {
            paramsBuilder.addParam('pageMode', pageMode.rawValue);
        }

        // TODO No table search in vdlx-datagrid
        // var showFilter = attributes['show-filter'];
        // if (showFilter) {
        //     paramsBuilder.addParam('showFilter', showFilter.rawValue === 'true');
        // }

        var columnFilter = attributes['column-filter'];
        if (columnFilter) {
            paramsBuilder.addParam('columnFilter', columnFilter.rawValue === 'true');
        }

        var addRemoveRow = attributes['add-remove-row'];
        if (addRemoveRow) {
            if (addRemoveRow.rawValue === 'true') {
                paramsBuilder.addParam('addRemoveRow', true);
            } else if (addRemoveRow.rawValue === 'addrow-autoinc') {
                paramsBuilder.addParam('addRemoveRow', 'addrow-autoinc');
            }
        }

        // TODO row selection?
        // var selectionNavigation = attributes['selection-navigation'];
        // if (selectionNavigation && selectionNavigation.rawValue === 'false') {
        //     paramsBuilder.addParam('selectionNavigation', false);
        // }

        var tableId = attributes['id'];
        if (tableId) {
            $element.attr('id', null);
            paramsBuilder.addParam('tableId', tableId.rawValue);
        }

        var width = attributes['width'];
        if (width) {
            paramsBuilder.addParam('width', width.rawValue);
        }

        // TODO state saving?
        // var saveState = attributes['save-state'];
        // if (saveState && saveState.rawValue === 'false') {
        //     paramsBuilder.addParam('saveState', false);
        // }

        var modifier = attributes['modifier'];
        if (modifier) {
            if (modifier.expression.isString) {
                throw Error('The vdl-table modifier attribute must be supplied as an expression');
            }
            paramsBuilder.addParam('modifier', modifier.expression.value, true);
        }

        var klass = attributes['class'];
        if (klass) {
            $element.removeAttr('class');
            paramsBuilder.addParam('class', klass.rawValue);
        }

        // TODO any way to achieve this? Is it needed?
        // var alwaysShowSelection = attributes['always-show-selection'];
        // if (alwaysShowSelection && (alwaysShowSelection.rawValue.toUpperCase() === 'TRUE')) {
        //     paramsBuilder.addParam('alwaysShowSelection', true);
        // }

        var rowFilter = attributes['row-filter'];
        if (rowFilter) {
            if (rowFilter.expression.isString) {
                throw Error('The vdl-table "row-filter" attribute must be supplied as an expression');
            }

            paramsBuilder.addFunctionOrExpressionParam(
                'rowFilter',
                rowFilter.expression.value,
                ['rowData', 'indices']);
        }

        // TODO temporary data
        var gridData = attributes['grid-data'];
        if (gridData) {
            paramsBuilder.addParam('gridData', gridData.expression.value, true);
        }

        // $element.children().wrapAll($('<div class="table-configuration">'));
        $tableDiv = $('<div/>');
        $tableDiv.attr('id', tableId.rawValue);
        $tableDiv.addClass('table-striped table-bordered table-condensed');
        $element.append($tableDiv);
    }
});
