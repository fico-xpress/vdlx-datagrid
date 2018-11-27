

/**
 * @param {Array<Array<*>>} data rows of values
 * @param {Array<String>} fields field names
 * @returns {Array<Object>}
 */
function pivotObject(data, fields) {
    let result = [];
    let dataLength = data.length;
    let rowSize = data[0].length;
    for (let j = 0; j < rowSize; j++) {
        let colData = {};
        for (let i = 0; i < dataLength; i++) {
            let row = data[i];
            colData[fields[i]] = row[j];
        }
        result.push(colData);
    }
    return result;
}

VDL('vdlx-datagrid', {
    tag: 'vdlx-datagrid',
    attributes: [
        {name: "column-filter"},
        {name: "group-by"},
        {name: "group-open"},
        {name: 'page-mode'},
        {name: 'page-size'},
        {name: 'height'},
        {name: 'id'},
    ],
    createViewModel: function (params, componentInfo) {

        var view = insight.getView();

        var vm = {};
        // debugger;
        vm.columnConfig = [];

        var showColumnFilters = !!params.showColumnFilters && params.showColumnFilters.toString().toLowerCase() === 'true';
        var groupBy = params.groupBy;
        var groupOpen = params.groupOpen;

        var firstDataLoad = true;

        vm.addColumnConfig = function (config) {
            vm.columnConfig = _.map(config, function (col) {

                var defaults =
                    {
                        title: col.entity || col.set,
                        field: col.entity || col.set,
                        resizable: false,
                        headerFilter: showColumnFilters
                    };
                var conf = _.assign({}, defaults, col);

                var cssClasses = [];

                if (!!col.set) {
                    cssClasses.push('index');
                }
                if (!!conf.editor) {
                    cssClasses.push('editable');
                }
                conf.cellEdited = function (cell) {
                    var field = cell.getField();
                    var keys = cell.getData().id.split(',');
                    var newValue = cell.getValue();
                    view
                        .withFirstScenario()
                        .withEntities(field)
                        .once(function (scenario) {
                            var payload = {key: keys, value: newValue};
                            console.log('Writing', field, payload);
                            scenario
                                .modify()
                                .setArrayElement(field, payload)
                                .commit();
                        })
                        .start();
                };

                if (!!col.elementType) {
                    // debugger;
                    switch (col.elementType) {
                        case 'NUMERIC':
                            cssClasses.push('numeric');
                            break;
                        case 'INTEGER':
                            cssClasses.push('numeric');
                            conf.validator = col.validator || 'integer';
                            break;
                        case 'BOOLEAN':
                            conf.cellClick = function () {
                                //e - the click event object
                                //cell - cell component
                                var cell = arguments[arguments.length - 1];
                                cell.setValue(!cell.getValue());
                            };
                            conf.formatter = function (cell, formatterParams, onRendered) {
                                //cell - the cell component
                                //formatterParams - parameters set for the column
                                //onRendered - function to call when the formatter has been rendered
                                if (cell.getValue()) {
                                    return '<div class="checkbox-editor"><input type="checkbox" checked /></div>';
                                }
                                return '<div class="checkbox-editor"><input type="checkbox" /></div>'; //return the contents of the cell;
                            };
                            conf.editor = false;
                            break;
                        case 'REAL':
                            cssClasses.push('numeric');
                            conf.validator = col.validator || 'float';
                            break;
                        case 'STRING':
                            // debugger;
                            break;
                        default:
                            cssClasses.push('unknown');
                            break;
                    }
                }
                conf.cssClass = cssClasses.join('-');
                return conf;
            });

            var tableOptions = {
                columns: vm.columnConfig,
                layout: "fitColumns",
                placeholder: 'Waiting for data',
                groupBy: groupBy,
                groupStartOpen: groupOpen === 'true',
                ajaxLoader: true,
            };
            var pageMode = params['pageMode'];
            if (pageMode === 'paged') {
                tableOptions.pagination = 'local';
                tableOptions.paginationSize = params.pageSize || 15;
            } else if (!pageMode || pageMode === 'none') {
                // tableOptions.height = params.tableHeight || '1130px';
                tableOptions.height = '600px';
            }
            tableOptions.tableBuilt = function() {
                console.timeEnd('+++TIME vdlx-datagrid RENDER');
            };
            vm.table = new Tabulator('#' + params.tableId, tableOptions);
        };

        vm.addColumnData = function (data) {
            var fields = _.map(vm.columnConfig, 'field');
            fields.push('id');

            var timeLabel2 = '+++TIME tableData vdlx-datagrid 161-163';
            console.time(timeLabel2);
            var tableData = pivotObject(data, fields);
            console.timeEnd(timeLabel2);

            if(firstDataLoad) {
                firstDataLoad = false;
                console.time('+++TIME vdlx-datagrid SETDATA');
                vm.table.setData(tableData).then(function() {
                    console.timeEnd('+++TIME vdlx-datagrid SETDATA');
                });
            } else {
                vm.table.replaceData(tableData);
            }
            _.defer(function() {
                vm.table.redraw();
            })
        };

        return vm;
    },
    transform: function (element, attributes, api) {
        console.time('+++TIME vdlx-datagrid RENDER');
        var $element = $(element);
        var paramsBuilder = api
            .getComponentParamsBuilder(element);
        if (attributes['group-by']) {
            paramsBuilder.addRawOrExpressionParam('groupBy', attributes['group-by']);
            if (attributes['group-open']) {
                paramsBuilder.addRawOrExpressionParam('groupOpen', attributes['group-open']);
            }
        }
        if (attributes['column-filter']) {
            paramsBuilder.addRawOrExpressionParam('showColumnFilters', attributes['column-filter']);
        }
        if (attributes['height']) {
            paramsBuilder.addRawOrExpressionParam('tableHeight', attributes['height']);
        }
        if (attributes['page-mode']) {
            paramsBuilder.addRawOrExpressionParam('pageMode', attributes['page-mode']);
        }
        if (attributes['page-size']) {
            paramsBuilder.addRawOrExpressionParam('pageSize', attributes['page-size']);
        }

        var tableId;
        if(attributes['id']) {
            $element.attr('id', null);
            if(attributes['id'].expression.isString) {
                tableId = attributes['id'].rawValue;
            } else {
                tableId = _.uniqueId('vdlx-datagrid-');
            }
        } else {
            tableId = _.uniqueId('vdlx-datagrid-');
        }
        paramsBuilder.addParam('tableId', tableId);

        $tableDiv = $('<div/>');
        $tableDiv.attr('id', tableId);
        $tableDiv.addClass('table-striped table-bordered table-condensed');
        $element.append($tableDiv);
    }
});
