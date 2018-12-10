import dataTransform, { getAllColumnIndices, getDisplayIndices, getPartialExposedKey, generateCompositeKey } from './data-transform';
import withScenarioData from './data-loader';
import Paginator from "./paginator";

const SelectOptions = insightModules.load('components/autotable-select-options');

class Datagrid {
    constructor(root, options$, columnOptions$) {
        this.options$ = options$;
        this.columnOptions$ = columnOptions$;
        this.componentRoot = root;
        this.table = undefined;
        this.schema = insight
            .getView()
            .getProject()
            .getModelSchema();
        this.buildTable();
    }

    buildTable () {
        const columnOptions$ = this.columnOptions$;
        const options$ = this.options$;

        const scenariosData$ = withScenarioData(columnOptions$);

        const table$ = ko.pureComputed(() => {
            const options = options$();
            const tabulatorOptions = {
                layout: 'fitColumns',
                placeholder: 'Waiting for data',
                groupStartOpen: false,
                ajaxLoader: true,
                columns: [],
                tableBuilt: _.partial(this.tableBuilt, this)
            };

            return new Tabulator(`#${options.tableId}`, tabulatorOptions);
        });

        table$.subscribe(oldTable => oldTable && oldTable.destroy(), null, 'beforeChange');

        ko.pureComputed(() => {
            const table = table$();
            const columnOptions = columnOptions$();
            const scenariosData = scenariosData$();

            if (table && columnOptions && scenariosData) {
                this.setColumnsAndData(table, columnOptions, scenariosData);
            }
            return undefined;
        }).subscribe(_.noop);
    }

    tableBuilt (self) {
        let $componentRoot = $(self.componentRoot);
        let $footerToolBar = $componentRoot.find('.footer-toolbar');
        const paginatorControl = new Paginator(this);
        paginatorControl.appendTo($footerToolBar);
    }

    setColumnsAndData(table, columnOptions, scenariosData) {
        const schema = this.schema;
        const indicesOptions = columnOptions.indicesOptions
        const entitiesOptions =columnOptions.columnOptions
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
            const { name, options } = setNameAndPosn;
            const entity = schema.getEntity(name);

            return {
                title: String(options.title || entity.getAbbreviation() || name),
                field: options.id,
                mutatorData: (value, data, type, params) => SelectOptions.getLabel(schema, allScenarios, entity, value)
            };
        });

        const columnsIds = _.map(setNamePosnsAndOptions, 'options.id').concat(_.map(entitiesOptions, 'id'));

        const entitiesColumns =  _.map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);

            return _.assign(entityOptions, {
                title: String(entityOptions.title || entity.getAbbreviation() || entityOptions.name),
                field: entityOptions.id,
                mutatorData: (value, data) => {
                    const rowData = _.map(columnsIds, _.propertyOf(data));
                    const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                    const keys = generateCompositeKey(tableKeys, setNameAndPosns, allColumnIndices[columnNumber], entityOptions);
                    const columnScenario = _.get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);
                    return window.insight.Formatter.getFormattedLabel(entity, columnScenario, value, keys);
                }
            });
        });
        const columns = [].concat(indicesColumns, entitiesColumns);

        const data = dataTransform(allColumnIndices, entitiesColumns, setNamePosnsAndOptions, scenariosData)

        table.setColumns(columns);

        return table
            .setData(data)
            .then(function () {
                table.redraw();
            })
            .catch(function (err) {
                debugger;
            });
    }
}

export default Datagrid;
