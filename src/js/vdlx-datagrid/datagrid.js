class Datagrid {

    constructor(options$) {
        options$.subscribe(this.buildTable);
    }

    buildTable(options) {
        $('#' + options.tableId).empty();

        const tableOptions = {
            layout: 'fitColumns',
            height: options.gridHeight || '600px',
            placeholder: 'Waiting for data',
            groupStartOpen: false,
            ajaxLoader: true
        };

        tableOptions.columns = _.flatten(
            _.map(options.indicesOptions, (setArray, setName) => {
                return _.map(setArray, (setObject, setPosition) => {
                    return _.assign(setObject, { title: setObject.set, field: setObject.set, setPosition: setPosition });
                });
            })
        );

        tableOptions.columns = tableOptions.columns.concat(
            _.map(options.columnOptions, entity => _.assign(entity, { title: entity.name, field: entity.name }))
        );

        const table = new Tabulator('#' + options.tableId, tableOptions);
        debugger;
        table
            .setData(options.gridData)
            .then(function () {
                table.redraw();
            })
            .catch(function (err) {
                debugger;
            });

    }
};

export default Datagrid;
