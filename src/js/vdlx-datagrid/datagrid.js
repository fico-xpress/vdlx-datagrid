import Tabulator from 'tabulator-tables/dist/js/tabulator';

import dataTransform, {
    getAllColumnIndices,
    getDisplayIndices,
    getPartialExposedKey,
    generateCompositeKey
} from './data-transform';
import withScenarioData from './data-loader';
import Paginator from './paginator';
import {getRowData} from './utils';
import {EDITOR_TYPES} from '../constants';
import AddRemove from './add-remove';
import {chooseColumnFilter} from './grid-filters';

const SelectOptions = insightModules.load('components/autotable-select-options');
const DataUtils = insightModules.load('utils/data-utils');

const dialogs = insightModules.load('dialogs')

import perf from '../performance-measurement';
import { createStateManager } from './state-peristence';

const SELECTION_CHANGED_EVENT = 'selection-changed';
const SELECTION_REMOVED_EVENT = 'selection-removed';

const addSelectNull = (items) => {
    if (Array.isArray(items)) {
        // add empty option to the start of the list
        items.unshift({key: '', value: ''});
    }
    return items;
};

const resolveDisplayEntity = (schema, entity) => {
    const labelsEntityName = entity.getLabelsEntity();
    if (!labelsEntityName) {
        return entity;
    }

    return schema.getEntity(labelsEntityName);
};

const VALIDATION_ERROR_TITLE = 'Validation Error';

class Datagrid {
    /**
     *
     * @param {Element} root
     * @param {*} gridOptions$
     * @param {*} columnOptions$
     */
    constructor(root, gridOptions$, columnOptions$) {
        /** @type {Array<KnockoutSubscription>} */
        this.subscriptions = [];

        this.entitiesColumns = undefined;
        this.indicesColumns = undefined;

        this.gridOptions$ = gridOptions$;
        this.columnOptions$ = columnOptions$;
        this.componentRoot = root;
        this.view = insight.getView();
        this.schema = this.view
            .getProject()
            .getModelSchema();

        const options = ko.unwrap(gridOptions$);

        this.table = this.createTable(options);

        const footerToolbar = root.querySelector('.footer-toolbar');

        this.addRemoveRowControl = this.createAddRemoveRowControl(footerToolbar, this.table, options);
        this.paginatorControl = this.createPaginatorControl(footerToolbar, this.table, options);
        this.stateManager = null;

        this.buildTable();
        this.update();
    }

    buildTable() {
        const columnOptions$ = this.columnOptions$;
        const gridOptions$ = this.gridOptions$;
        const scenariosData$ = withScenarioData(columnOptions$);

        this.subscriptions = this.subscriptions.concat(
            ko
                .pureComputed(() => {
                    const gridOptions = ko.unwrap(gridOptions$());
                    const columnOptions = columnOptions$();
                    const scenariosData = scenariosData$();

                    if (gridOptions && columnOptions && scenariosData) {
                        perf('PERF TOTAL:', () => this.setColumnsAndData(gridOptions, columnOptions, scenariosData));
                    }
                    return undefined;
                })
                .subscribe(_.noop)
        );
    }

    update() {
        this.validate();
        this.updatePaginator();
        this.recalculateHeight(ko.unwrap(this.gridOptions$));
        this.recalculateWidth();
    }

    saveState() {
        if (this.stateManager) {
            const state = {
                filters: this.table.getHeaderFilters(),
                sorters: _.map(this.table.getSorters(), sorter => ({ dir: sorter.dir, column: sorter.field }))
            };

            this.stateManager.saveState(state);
        }
    }
    loadState() {
        if (this.stateManager) {
            const state = this.stateManager.loadState();
            if (state) {
                !_.isEmpty(state.sorters) && this.table.setSort(state.sorters);
                if (!_.isEmpty(state.filters)) {
                    // TODO: temporary until tabulator merges a pull request
                    // https://github.com/olifolkerd/tabulator/pull/1685
                    const removeOldHeaderFilter = column => _.each(
                        column.getElement().getElementsByClassName('tabulator-header-filter'),
                        elm => elm.parentNode.removeChild(elm)
                    );
                    _.each(this.table.getColumns(), removeOldHeaderFilter);

                    this.table.clearHeaderFilter();
                    _.each(state.filters, filter => {
                        const column = this.table.getColumn(filter.field);
                        if (!column) {
                            return;
                        }

                        removeOldHeaderFilter(column);

                        this.table.setHeaderFilterValue(filter.field, filter.value)
                    });
                }
            }
        }
    }

    createTable(options) {
        const select = (row) => {
            _.each(_.filter(this.table.getSelectedRows(), selectedRow =>
                selectedRow.getPosition() !== row.getPosition()
            ), selectedRow => selectedRow.deselect());

            if (!row.isSelected()) {
                row.select();
            }
        }
        const saveState = () => this.saveState();

        const tabulatorOptions = {
            pagination: options.pagination,
            paginationSize: options.paginationSize,
            paginationElement: options.paginationElement,
            layout: 'fitDataFill',
            placeholder: 'No data available',
            groupStartOpen: false,
            ajaxLoader: true,
            height: '100%',
            resizableColumns: false,
            dataFiltered: saveState,
            dataSorting: saveState,
            cellEditing: (cell) => select(cell.getRow()),
            rowClick: (e, row) => select(row),
            rowSelectionChanged: (data, rows) => this.setSelectedRow(_.first(rows)),
            renderComplete: () => this.update(),
        };

        const table = new Tabulator(`#${options.tableId}`, tabulatorOptions);

        return table;
    }

    recalculateHeight(options) {
        if (_.get(options, 'overrides.paging', 'scrolling') === 'scrolling') {
            let height;
            if (this.table.getDataCount() > options.paginationSize) {
                height = options.gridHeight;
                if (!height) {
                    const row = this.table.getRowFromPosition(0, true);
                    height = $(row.getElement()).outerHeight(true) * options.paginationSize;
                }
            } else {
                height = '100%';
            }

            this.table.setHeight(height);
        }
    }

    recalculateWidth() {
        const tableWidth = $(this.table.element).width();
        const columnsWidth = this.table.columnManager.getWidth();

        if (columnsWidth < tableWidth) {
            const columns = _.reject(this.table.getColumns(), column => !!column.getDefinition().width);
            const toAddPx = (tableWidth - columnsWidth) / columns.length;

            _.each(columns, column =>
                column._column.setWidthActual(column._column.getWidth() + toAddPx)
            );
        }
    }

    setSelectedRow(row) {
        if (this.addRemoveRowControl) {
            this.addRemoveRowControl.setSelectedRow(row);
        }

        if (row) {
            const rowPosition = row.getPosition();
            const rowData = _.map(row.getCells(), cell => cell.getValue());

            const getCell = (cell, cellIndex) => (
                {
                    rowData: rowData,
                    value: cell.getValue(),
                    element: cell.getElement(),
                    displayPosition: { row: rowPosition, column: cellIndex },
                }
            );

            const cells = _.map(row.getCells(), getCell);

            $(this.table.element).trigger(SELECTION_CHANGED_EVENT, {
                selection: cells,
                activeCell: _.first(cells),
                selectionType: 'ROW'
            });
        } else {
            $(this.table.element).trigger(SELECTION_REMOVED_EVENT);
        }
    }

    /**
     * @param {Element} footerToolbar
     * @param {*} table
     * @param {*} options
     * @returns
     * @memberof Datagrid
     */
    createPaginatorControl(footerToolbar, table, options) {
        if (!options.pagination) {
            return undefined;
        }

        const paginatorControl = new Paginator(table, options.paginationSize);
        paginatorControl.appendTo(footerToolbar);
        return paginatorControl;
    }

    createStateManager(gridOptions, setNameAndPosns, scenarios) {
        if (gridOptions.saveState) {
            const saveStateSuffix = _.map(setNameAndPosns, 'name')
                .join('#');

            return createStateManager(gridOptions.tableId, saveStateSuffix);
        }
        return undefined;
    }

    /**
     * @param {Element} footerToolbar
     * @param {*} table
     * @param {*} options
     * @returns
     * @memberof Datagrid
     */
    createAddRemoveRowControl(footerToolbar, table, options) {
        if (!options.addRemoveRow) {
            return undefined;
        }

        const addRemoveControl = new AddRemove(table, options.addRemoveRow === 'addrow-autoinc');
        addRemoveControl.setEnabled(false);
        addRemoveControl.appendTo(footerToolbar);

        return addRemoveControl;
    }

    updatePaginator() {
        if (this.paginatorControl) {
            this.paginatorControl.updatePageIndicators();
        }
    }

    /**
     *
     * @param {boolean} enabled
     * @memberof Datagrid
     */
    updateAddRemoveControl(enabled, indicesColumns, entitiesColumns, defaultScenario, allSetValues, data) {
        if (this.addRemoveRowControl) {
            this.addRemoveRowControl.setEnabled(enabled);
            this.addRemoveRowControl.update(indicesColumns, entitiesColumns, defaultScenario, allSetValues, data);
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
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = DataUtils.entityTypeIsNumber(displayEntity);

            const title = _.get(options, 'title', entity.getAbbreviation() || name);
            const getClass = () => {
                let classes = ['index'];
                if (isNumberEntity) {
                    classes = classes.concat('numeric');
                }
                return classes.join('-');
            }
            return _.assign({}, setNameAndPosn.options, {
                title: _.escape(String(title)),
                field: options.id,
                cssClass: getClass(),
                formatter: (cell) => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue()),
                dataType: entity.getType(),
                elementType: entity.getElementType(),
                labelsEntity: entity.getLabelsEntity(),
                name: name
            });
        });

        const columnsIds = [].concat(_.map(setNamePosnsAndOptions, 'options.id'), _.map(entitiesOptions, 'id'));

        const getRowDataForColumns = getRowData(columnsIds);

        const entitiesColumns = _.map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = DataUtils.entityTypeIsNumber(displayEntity);

            const columnScenario = _.get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);

            const setArrayElement = (change) => columnScenario.modify().setArrayElement(entityOptions.name, change).commit();

            const getRowKey = _.compose(
                (rowData) => {
                    const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                    return generateCompositeKey(tableKeys, setNameAndPosns, allColumnIndices[columnNumber], entityOptions);
                },
                getRowDataForColumns
            );

            const saveValue = (rowData, value) => setArrayElement({key: getRowKey(rowData), value: value});

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
                cell.setValue(newValue);
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
                            _.partial(SelectOptions.generateSelectOptionsFromValues, _, isNumberEntity),
                            entityOptions.selectNull ? addSelectNull : _.identity
                        );
                    }

                    const getListItemFormatter = () => {
                        if (isNumberEntity) {
                            return (value, title) => `<div class="numeric">${title}</div>`;
                        } 
                        return undefined;
                    }

                    return cell =>
                        ({
                            listItemFormatter: getListItemFormatter(),
                            values: _.map(getOptions(cell.getValue(), getRowKey(cell.getData())), option => ({
                                value: option.key,
                                label: option.value
                            }))
                        });
                }
                return undefined;
            }

            const validate = (cell, newValue) => {
                const data = cell.getData();
                const keys = getRowKey(data);

                // Perform entity validation first
                let result = insight.validation.EntityValidator.checkValue(entity, newValue, undefined, keys);

                if (result.isValid && (typeof entityOptions.editorValidate === 'function')) {
                    result = entityOptions.editorValidate.call(this, newValue, getRowDataForColumns(data), keys);
                }

                return result;
            }

            const validateAndStyle = (cell, newValue) => {
                const validationResult = validate(cell, newValue);

                const element = cell.getElement()
                if (!validationResult.isValid) {
                    element.classList.add('invalid');
                } else {
                    element.classList.remove('invalid');
                }

                return validationResult;
            };

            const title = _.get(entityOptions, 'title', entity.getAbbreviation() || name);

            const getCellEditingHandler = () => {
                if (entityOptions.editorType !== 'select') {
                    return cell => {
                        const element = cell.getElement();
                        $(element).on('keyup', (evt) => {
                            validateAndStyle(cell, evt.target.value);
                        });
                    };
                }
                return undefined;
            }

            const getClasses = () => {
                let classes = [];
                if (isNumberEntity) {
                    classes = classes.concat('numeric');
                }
                if (entityOptions.editorType === 'select') {
                    classes = classes.concat('select-editor')
                }
                return classes.join('-');
            }

            return _.assign({}, entityOptions, {
                title: _.escape(String(title)),
                field: entityOptions.id,
                cssClass: getClasses(),
                cellClick: getCellClickHandler(),
                formatter: getFormatter(),
                editor: entityOptions.editorType,
                editorParams: getEditorParams(),
                cellEditing: getCellEditingHandler(),
                cellEdited: cell => {
                    $(cell.getElement()).off('keyup');

                    const oldValue = _.isUndefined(cell.getOldValue()) ? '' : cell.getOldValue();
                    const value = cell.getValue();

                    const validationResult = validateAndStyle(cell, value);

                    if (!validationResult.isValid && !validationResult.allowSave) {
                        cell.restoreOldValue();
                        validateAndStyle(cell, cell.getValue());
                        dialogs.alert(validationResult.errorMessage, VALIDATION_ERROR_TITLE, () => {
                            _.defer(() => cell.edit(true));
                        });
                    } else {
                        if (value !== oldValue) {
                            saveValue(cell.getData(), value)
                                .then(() => this.table.redraw(true))
                                .catch(err => {
                                    cell.restoreOldValue();
                                    // TODO: message saying 
                                    // Could not save new value (4.444444444444444e+37) for entity FactoryDemand, indices [New York,January]. The display value will be reverted.
                                });
                        }
                    }
                },
                dataType: entity.getType(),
                elementType: entity.getElementType(),
                scenario: columnScenario,
                getRowKey: getRowKey,
                validate: validateAndStyle
            });
        });

        const overrides = gridOptions.overrides;
        const columns = _.map([].concat(indicesColumns, entitiesColumns), col => {
            if (!!overrides.columnFilter) {
                col.headerFilterPlaceholder = 'No filter';
                // col.headerFilter = fullTitleFormatter;
                col.headerFilter = true;
                col.headerFilterFunc = chooseColumnFilter(col);
            }

            return col;
        });

        const {data, allSetValues} = perf('PERF Data generation:', () =>
            dataTransform(
                allColumnIndices,
                columns,
                entitiesColumns,
                setNamePosnsAndOptions,
                scenariosData,
                gridOptions.rowFilter
            )
        );

        const editable = _.some(_.reject(entitiesOptions, options => !_.get(options, 'visible', true)), 'editable');
        if (!editable && gridOptions.addRemoveRow) {
            console.log(`vdl-table (${gridOptions.tableId}): add/remove rows disabled. Table needs to have at least one editable column to use this feature.`);
        }
        const addRemoveRow = editable && gridOptions.addRemoveRow;
        this.updateAddRemoveControl(addRemoveRow, indicesColumns, entitiesColumns, scenariosData.defaultScenario, allSetValues, data);
        this.entitiesColumns = entitiesColumns;
        this.indicesColumns = indicesColumns;

        table.setColumns(columns);

        this.stateManager = this.createStateManager(gridOptions, setNameAndPosns, _.map(entitiesColumns, 'scenario'));
        this.loadState();

        return perf('PERF Tabulator.setData():', () => table
            .setData(data)
            .then(() => table.redraw())
            .catch(err => {
                debugger;
            }));
    }

    validate() {
        const editableColumns = _.filter(this.entitiesColumns, 'editable');
        _.each(editableColumns, column => {
            const cells = this.table.columnManager.columnsByField[column.field].cells;
            _.each(cells, cell => {
                column.validate(cell.getComponent(), cell.getValue());
            })
        });
    }

    dispose() {
        this.table.destroy();
        _.each(this.subscriptions, subscription => subscription.dispose());
    }
}

export default Datagrid;
