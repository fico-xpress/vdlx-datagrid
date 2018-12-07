import dataTransform from './data-transform';
import Paginator from "./paginator";

class Datagrid {

    /**
     *
     * @param options$ Table Options for passing to the Tabulator Library
     * @param root of the VDLX-DATAGRID component
     */
    constructor(options$, root) {
        options$.subscribe(this.buildTable, this);
        this.componentRoot = root;
        this.table = undefined;
    }

    buildTable(options) {
        $('#' + options.tableId).empty();

        const defaults = {
            layout: 'fitColumns',
            placeholder: 'Waiting for data',
            groupStartOpen: false,
            ajaxLoader: true
        };

        const data = dataTransform(options);

        defaults.columns = _.flatten(
            _.map(options.indicesOptions, (setArray, setName) => {
                return _.map(setArray, (setObject, setPosition) => {
                    return _.assign(setObject, {title: setObject.set, field: setObject.set, setPosition: setPosition});
                });
            })
        );

        defaults.columns = defaults.columns.concat(
            _.map(options.columnOptions, entity => _.assign(entity, {title: entity.name, field: entity.name}))
        );

        const tableOptions = _.assign(defaults, _.omit(options, ['columnOptions', 'indicesOptions']));

        // TODO work out table callbacks handling

        // TODO this needs to take account of tableBuilt being set beforehand
        tableOptions.tableBuilt = _.partial(this.tableBuilt, this);

        this.table = new Tabulator('#' + options.tableId, tableOptions);

        this.table
            .setData(options.gridData || data)
            .then(() => {
                this.table.redraw();
            })
            .catch(err => {
                debugger;
            });

    }

    /**
     * Because this is set to the Tabulator library we pass in Datagrid this as a parameter.
     * @param datagridSelf
     */
    tableBuilt(datagridSelf) {
        let $componentRoot = $(datagridSelf.componentRoot);
        let $footerToolBar = $componentRoot.find('.footer-toolbar');
        const paginatorControl = new Paginator(this);
        paginatorControl.appendTo($footerToolBar);
    }
}

export default Datagrid;
