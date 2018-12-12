import dataTransform, {
    getAllColumnIndices,
    getDisplayIndices,
    getPartialExposedKey,
    generateCompositeKey
} from './data-transform';
import withScenarioData from './data-loader';
import Paginator from "./paginator";
import { getRowData } from './utils';
import { EDITOR_TYPES } from '../constants';

const SelectOptions = insightModules.load('components/autotable-select-options');
const DataUtils = insightModules.load('utils/data-utils');

const addSelectNull = (items) => {
    if (Array.isArray(items)) {
        // add empty option to the start of the list
        items.unshift({key: '', value: ''});
    }
    return items;
};

class Datagrid {
    constructor(root, gridOptions$, columnOptions$) {

        this.gridOptions$ = gridOptions$;
        this.columnOptions$ = columnOptions$;
        this.componentRoot = root;
        this.view = insight.getView();
        this.schema = this.view
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
            placeholder: 'No data available',
            groupStartOpen: false,
            ajaxLoader: true,
            height: '100%',
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

    setColumnsAndData(gridOptions, columnOptions, scenariosData) {
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
        }));

        const allScenarios = _.uniq([scenariosData.defaultScenario].concat(_.values(scenariosData.scenarios)));

        const indicesColumns = _.map(setNamePosnsAndOptions, setNameAndPosn => {
            const {name, options} = setNameAndPosn;
            const entity = schema.getEntity(name);
            // debugger;
            return {
                title: _.escape(String(options.title || entity.getAbbreviation() || name)),
                field: options.id,
                cssClass: 'expanding-cell-height',
                formatter: (cell) => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue()),
                dataType: entity.getType(),
                elementType: entity.getElementType(),
                labelsEntity: entity.getLabelsEntity()
            };
        });

        const columnsIds = [].concat(_.map(setNamePosnsAndOptions, 'options.id'), _.map(entitiesOptions, 'id'));

        const getRowDataForColumns = getRowData(columnsIds);

        const editable = _.some(_.reject(entitiesOptions, options => !options.visible), 'editable');

        const addRemoveRow = editable && gridOptions.addRemoveRow;

        const entitiesColumns = _.map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);

            const columnScenario = _.get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);

            const setArrayElement = (change) => columnScenario.modify().setArrayElement(entityOptions.name, change).commit();

            const getRowKey = _.compose(
                (rowData) => {
                    const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                    return generateCompositeKey(tableKeys, setNameAndPosns, allColumnIndices[columnNumber], entityOptions);
                },
                getRowDataForColumns
            );

            const saveValue = (rowData, value) => setArrayElement({ key: getRowKey(rowData), value: value });

            const checkboxFormatter = (cell) => {
                const checked = String(cell.getValue()) === String(_.get(entityOptions, 'checkedValue', true)) ? 'checked' : '';
                const disabled = entityOptions.editable ? '' : 'disabled';
                return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
            };

            const defaultFormatter = (cell) => {
                const keys = getRowKey(cell.getData());
                return window.insight.Formatter.getFormattedLabel(entity, columnScenario, cell.getValue(), keys);
            }

            const getFormatter = () => {
                if (entityOptions.editorType === EDITOR_TYPES.checkbox) {
                    return checkboxFormatter;
                } else {
                    return defaultFormatter;
                }
            };

            const checkboxCellClickHandler = (e, cell) => {
                const checkedValue = _.get(entityOptions, 'checkedValue', true);
                const uncheckedValue = _.get(entityOptions, 'uncheckedValue', false);
                const newValue = String(cell.getValue()) === String(checkedValue) ? uncheckedValue : checkedValue;
                const value = newValue;

                saveValue(cell.getData(), value)
                    .catch(err => {
                        debugger;
                    });
            };

            const getCellClickHandler = () => {
                if (entityOptions.editorType === EDITOR_TYPES.checkbox) {
                    return checkboxCellClickHandler;
                }
                return undefined;
            };

            const getEditorParams = () => {
                if (entityOptions.editorType === EDITOR_TYPES.select) {
                    let getOptions;
                    if (entityOptions.editorOptionsSet) {
                        getOptions = _.flow(
                            () => SelectOptions.generateSelectOptions(
                                schema,
                                [columnScenario],
                                entityOptions.editorOptionsSet,
                                columnScenario.getSet(entityOptions.editorOptionsSet)),
                            entityOptions.selectNull ? addSelectNull : _.identity
                        );
                    } else if (entityOptions.editorOptions) {
                        getOptions = _.flow(
                            entityOptions.editorOptions,
                            _.partial(SelectOptions.generateSelectOptionsFromValues, _, DataUtils.entityTypeIsNumber(entity)),
                            entityOptions.selectNull ? addSelectNull : _.identity
                        );
                    }

                    return cell => ({
                        values: _.map(getOptions(cell.getValue(), getRowKey(cell.getData())), option => ({
                            value: option.key,
                            label: option.value
                        }))
                    });
                }
                return undefined;
            }

            return _.assign({}, entityOptions, {
                title: _.escape(String(entityOptions.title || entity.getAbbreviation() || entityOptions.name)),
                field: entityOptions.id,
                cssClass: 'expanding-cell-height',
                cellClick: getCellClickHandler(),
                formatter: getFormatter(),
                editor: entityOptions.editorType,
                editorParams: getEditorParams(),
                cellEdited: (cell) => {
                    const value = cell.getValue();
                    saveValue(cell.getData(), value)
                        .catch(err => {
                            debugger;
                        });
                },
                dataType: entity.getType(),
                elementType: entity.getElementType()
            });
        });

        const overrides = gridOptions.overrides;
        const columns = _.map([].concat(indicesColumns, entitiesColumns), col => {
            if (!!overrides.columnFilter) {
                col.headerFilter = true;
            }
            // debugger;
            let hasLabels = !!col.labelsEntity;

            var cssClasses = [];
            if (col.dataType === 'SET') {
                cssClasses.push('index');
            }
            if(hasLabels) {

            } else {
                switch(col.elementType) {
                    case 'NUMERIC':
                        cssClasses.push('numeric');
                        break;
                    case 'INTEGER':
                        cssClasses.push('numeric');
                        break;
                    case 'REAL':
                        cssClasses.push('numeric');
                        break;
                    case 'BOOLEAN':
                        cssClasses.push('numeric');
                        break;
                    default:

                        break;
                }
            }
            col.cssClass = cssClasses.join('-');

            return col;
        });

        const data = dataTransform(allColumnIndices, columns, entitiesColumns, setNamePosnsAndOptions, scenariosData, gridOptions.rowFilter);
        if(data.length > gridOptions.paginationSize) {
            if(_.get(gridOptions, 'overrides.paging', 'scrolling') === 'scrolling') {
                table.setHeight(_.get(gridOptions, 'overrides.gridHeight', '600px'));
            }
        }
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
