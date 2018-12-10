import dataTransform, {
    getAllColumnIndices,
    getDisplayIndices,
    getPartialExposedKey,
    generateCompositeKey
} from './data-transform';
import withScenarioData from './data-loader';
import Paginator from "./paginator";

const SelectOptions = insightModules.load('components/autotable-select-options');

class Datagrid {
    constructor(root, gridOptions$, columnOptions$) {

        this.gridOptions$ = gridOptions$;
        this.columnOptions$ = columnOptions$;
        this.componentRoot = root;
        this.table = undefined;
        this.schema = insight
            .getView()
            .getProject()
            .getModelSchema();

        const options = ko.unwrap(gridOptions$);

        this.table = this.createTable(options);

        this.paginatorControl = this.createPaginatorControl(this.componentRoot, this.table, options);

        this.buildTable();
    }

    buildTable() {
        const columnOptions$ = this.columnOptions$;
        const gridOptions$ = this.gridOptions$;
        const scenariosData$ = withScenarioData(columnOptions$);

        ko.pureComputed(() => {
            const gridOptions = ko.unwrap(gridOptions$());
            const columnOptions = columnOptions$();
            const scenariosData = scenariosData$();

            if (gridOptions && columnOptions && scenariosData) {
                this.setColumnsAndData(gridOptions, columnOptions, scenariosData);
            }
            return undefined;
        }).subscribe(_.noop);
    }

    createTable(options) {
        const tabulatorOptions = {
            pagination: options.pagination,
            paginationSize: options.paginationSize,
            paginationElement: options.paginationElement,
            layout: 'fitColumns',
            placeholder: 'Waiting for data',
            groupStartOpen: false,
            ajaxLoader: true,
            columns: [],
        };

        return new Tabulator(`#${options.tableId}`, tabulatorOptions);
    }

    createPaginatorControl(componentRoot, table, options) {
        if (!options.pagination) {
            return undefined;
        }

        const $componentRoot = $(componentRoot);
        const $footerToolBar = $componentRoot.find('.footer-toolbar');
        const paginatorControl = new Paginator(table);
        paginatorControl.appendTo($footerToolBar);
        return paginatorControl;
    }

    updatePaginator() {
        if (this.paginatorControl) {
            this.paginatorControl.updatePageIndicators();
        }
    }

    setColumnsAndData(options, columnOptions, scenariosData) {
        const table = this.table;
        const schema = this.schema;
        const indicesOptions = columnOptions.indicesOptions;
        const entitiesOptions = columnOptions.columnOptions;
        const allColumnIndices = getAllColumnIndices(schema, entitiesOptions);

        const setNameAndPosns = getDisplayIndices(allColumnIndices, entitiesOptions);

        const setNamePosnsAndOptions = _.map(setNameAndPosns, setNameAndPosn => ({
            ...setNameAndPosn,
            options: _.get(indicesOptions, `${setNameAndPosn.name}.${setNameAndPosn.position}`, {
                id: `${setNameAndPosn.name}_${setNameAndPosn.position}`
            })
        }))

        const allScenarios = _.uniq([scenariosData.defaultScenario].concat(_.values(scenariosData.scenarios)));

        const indicesColumns = _.map(setNamePosnsAndOptions, setNameAndPosn => {
            const {name, options} = setNameAndPosn;
            const entity = schema.getEntity(name);

            return {
                title: _.escape(String(options.title || entity.getAbbreviation() || name)),
                field: options.id,
                cssClass: 'expanding-cell-height',
                mutatorData: (value, data, type, params) => SelectOptions.getLabel(schema, allScenarios, entity, value)
            };
        });

        const columnsIds = _.map(setNamePosnsAndOptions, 'options.id').concat(_.map(entitiesOptions, 'id'));

        const entitiesColumns = _.map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);

            return _.assign(entityOptions, {
                title: _.escape(String(entityOptions.title || entity.getAbbreviation() || entityOptions.name)),
                field: entityOptions.id,
                cssClass: 'expanding-cell-height',
                mutatorData: (value, data) => {
                    const rowData = _.map(columnsIds, _.propertyOf(data));
                    const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                    const keys = generateCompositeKey(tableKeys, setNameAndPosns, allColumnIndices[columnNumber], entityOptions);
                    const columnScenario = _.get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);
                    return window.insight.Formatter.getFormattedLabel(entity, columnScenario, value, keys);
                }
            });
        });


        const overrides = this.gridOptions$().overrides;
        const columns = _.map([].concat(indicesColumns, entitiesColumns), col => {
            if (!!overrides.columnFilter) {
                col.headerFilter = true;
            }
            return col;
        });

        const data = dataTransform(allColumnIndices, entitiesColumns, setNamePosnsAndOptions, scenariosData, options.rowFilter)


        table.setColumns(columns);

        return table
            .setData(data)
            .then(() => {
                table.redraw();
                this.updatePaginator();
            })
            .catch((err) => {
                debugger;
            });
    }
}

export default Datagrid;
