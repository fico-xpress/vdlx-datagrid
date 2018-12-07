import dataTransform, { getAllColumnIndices, getDisplayIndices, getPartialExposedKey, generateCompositeKey } from './data-transform';
import { map, combineMap, filter, startWith, combineLatest, withDeepEquals } from './ko-utils';
import withScenarioData from './data-loader';
import Paginator from "./paginator";

const SelectOptions = insightModules.load('components/autotable-select-options');

const createTabulatorFactory = selector => config => new Tabulator(selector, config);
const someEmpty = values => _.some(values, _.isEmpty);
const notSomeEmpty = _.negate(someEmpty);

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


        const scenariosData$ = _.compose(
            filter(v => v && v.defaultScenario),
            startWith(undefined),
            withScenarioData
        )(columnOptions$);

        const tabulatorFactory$ = map(
            options => (options.tableId ? createTabulatorFactory(`#${options.tableId}`) : _.noop),
            options$
        );

        const tabulatorOptions$ = map(
            options => ({
                layout: 'fitColumns',
                placeholder: 'Waiting for data',
                groupStartOpen: false,
                ajaxLoader: true,
                columns: [],
                tableBuilt: _.partial(this.tableBuilt, this)
            }),
            options$
        );

        const table$ = combineMap(([factory, options]) => factory(options), [tabulatorFactory$, tabulatorOptions$]);

        table$.subscribe(oldTable => oldTable && oldTable.destroy(), null, 'beforeChange');

        _.compose(
            map((values) => {
                if (!values) {
                    return
                }

                return this.setColumnsAndData(...values);
            }),
            filter(notSomeEmpty),
            startWith(undefined),
            combineLatest
        )([table$, columnOptions$, scenariosData$]).subscribe(_.noop);

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

        const entitiesIds = _.map(entitiesOptions, 'id');

        const entitiesColumns =  _.map(entitiesOptions, entityOptions => {
            const entity = schema.getEntity(entityOptions.name);

            return _.assign(entityOptions, {
                title: String(entityOptions.title || entity.getAbbreviation() || entityOptions.name),
                field: entityOptions.id,
                mutatorData: (value, data) => {
                    // const rowData = _.map(entitiesIds, _.propertyOf(data));
                    // const tableKeys = getPartialExposedKey(setNameAndPosns, data);
                    // const keys = generateCompositeKey(tableKeys, setNameAndPosns, columnIndices[columnNumber], entityOptions);
                    // const cellValue = window.insight.Formatter.getFormattedLabel(entity, columnScenario, value, keys);

                    return value;
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
