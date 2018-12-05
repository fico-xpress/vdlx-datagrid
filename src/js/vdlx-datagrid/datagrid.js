import dataTransform from './data-transform';

class Datagrid {

    constructor(options$) {
        options$.subscribe(this.buildTable);
    }

    buildTable(options) {
        $('#' + options.tableId).empty();

        const defaults = {
            layout: 'fitColumns',
            // height: options.gridHeight || '600px', TODO is there ever a time that height is needed?
            placeholder: 'Waiting for data',
            groupStartOpen: false,
            ajaxLoader: true
        };

        const data = dataTransform(options);

        defaults.columns = _.flatten(
            _.map(options.indicesOptions, (setArray, setName) => {
                return _.map(setArray, (setObject, setPosition) => {
                    return _.assign(setObject, { title: setObject.set, field: setObject.set, setPosition: setPosition });
                });
            })
        );

        defaults.columns = defaults.columns.concat(
            _.map(options.columnOptions, entity => _.assign(entity, { title: entity.name, field: entity.name }))
        );

        const tableOptions = _.assign(defaults, _.omit(options, ['columnOptions', 'indicesOptions']));

        const table = new Tabulator('#' + options.tableId, tableOptions);
        table
            .setData(options.gridData || data)
            .then(function () {
                table.redraw();
            })
            .catch(function (err) {
                debugger;
            });

    }
};

export default Datagrid;
