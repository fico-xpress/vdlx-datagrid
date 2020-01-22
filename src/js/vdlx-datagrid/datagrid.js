/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/datagrid.js
   ```````````````````````
   vdlx-datagrid datagrid.

    (c) Copyright 2019 Fair Isaac Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */
import Tabulator from 'tabulator-tables/dist/js/tabulator';

import dataTransform, {
    getAllColumnIndices,
    getDisplayIndices,
    getPartialExposedKey,
    generateCompositeKey
} from './data-transform';
import withScenarioData from './data-loader';
import ExportCsv from './export-csv';
import Paginator from './paginator';
import { getRowData } from './utils';
import { EDITOR_TYPES } from '../constants';
import AddRemove from './add-remove';
import { chooseColumnFilter } from './grid-filters';

const SelectOptions = insightModules.load('components/autotable-select-options');
const DataUtils = insightModules.load('utils/data-utils');

const dialogs = insightModules.load('dialogs');

import perf from '../performance-measurement';
import { createStateManager } from './state-peristence';
import { DatagridLock } from './datagrid-lock';
import escape  from 'lodash/escape';
import delay from 'lodash/delay';
import some from 'lodash/some';
import find from 'lodash/find';
import defer from 'lodash/defer';
import isUndefined from 'lodash/isUndefined';
import identity from 'lodash/identity';
import flow from 'lodash/flow';
import flowRight from 'lodash/flowRight';
import assign from 'lodash/assign';
import values from 'lodash/values';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import map from 'lodash/map';
import reject from 'lodash/reject';
import inRange from 'lodash/inRange';
import first from 'lodash/first';
import filter from 'lodash/filter';
import each from 'lodash/each';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';


const SELECTION_CHANGED_EVENT = 'selection-changed';
const SELECTION_REMOVED_EVENT = 'selection-removed';

const addSelectNull = items => {
    if (isArray(items)) {
        // add empty option to the start of the list
        return [{ key: undefined, value: '' }].concat(items);
    }
    return items;
};

// Make table inactive when clicking out of the table
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
        this.schema = this.view.getProject().getModelSchema();

        const options = ko.unwrap(gridOptions$);

        this.table = this.createTable(options);

        const headerToolbar = root.querySelector('.header-toolbar');
        const footerToolbar = root.querySelector('.footer-toolbar');

        this.addRemoveRowControl = this.createAddRemoveRowControl(footerToolbar, this.table, options);
        this.paginatorControl = this.createPaginatorControl(footerToolbar, this.table, options);
        this.exportCsvControl = this.createExportControl(headerToolbar, options);
        this.stateManager = null;

        this.tableLock = new DatagridLock(this.table.element);

        this.buildTable();
        this.update();

        const mouseDownListener = e => {
            if (!root.contains(e.target)) {
                if (!isEmpty(this.table.getSelectedRows()) && !options.alwaysShowSelection) {
                    this.table.modules.selectRow.deselectRows();
                }
            }
        };
        document.addEventListener('mousedown', mouseDownListener);

        this.subscriptions = this.subscriptions.concat([
            {
                dispose: () => {
                    document.removeEventListener('mousedown', mouseDownListener);
                }
            }
        ]);
    }

    buildTable() {
        const columnOptions$ = this.columnOptions$;
        const gridOptions$ = this.gridOptions$;
        const { data: scenariosData$, errors: errors$ } = withScenarioData(columnOptions$);

        this.subscriptions = this.subscriptions.concat(
            ko
                .pureComputed(() => {
                    const gridOptions = ko.unwrap(gridOptions$());
                    const columnOptions = columnOptions$();
                    const scenariosData = scenariosData$();
                    const errors = errors$();

                    if (errors) {
                        this.componentRoot.style.display = 'none';
                    } else {
                        this.componentRoot.style.display = 'block';
                    }

                    if (!isEmpty(get(columnOptions, 'columnOptions'))) {
                        this.tableLock.lock();
                    }

                    if (gridOptions && columnOptions && scenariosData) {
                        return perf('PERF TOTAL:', () =>
                            this.setColumnsAndData(gridOptions, columnOptions, scenariosData).then(() =>
                                this.tableLock.unlock()
                            )
                        );
                    }
                    return undefined;
                })
                .subscribe(noop)
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
                sorters: map(this.table.getSorters(), sorter => ({ dir: sorter.dir, column: sorter.field }))
            };

            this.stateManager.saveState(state);
        }
    }
    loadState() {
        if (this.stateManager) {
            const state = this.stateManager.loadState();
            if (state) {
                !isEmpty(state.sorters) && this.table.setSort(state.sorters);
                if (!isEmpty(state.filters)) {
                    this.table.clearHeaderFilter();
                    each(state.filters, filter => {
                        const column = this.table.getColumn(filter.field);
                        if (!column) {
                            return;
                        }

                        this.table.setHeaderFilterValue(filter.field, filter.value);
                    });
                }
            }
        }
    }

    createTable(options) {
        const select = row => {
            each(
                filter(this.table.getSelectedRows(), selectedRow => selectedRow.getPosition() !== row.getPosition()),
                selectedRow => selectedRow.deselect()
            );

            if (!row.isSelected()) {
                row.select();
            }
        };
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
            cellEditing: cell => select(cell.getRow()),
            rowClick: (e, row) => select(row),
            rowSelectionChanged: (data, rows) => this.setSelectedRow(first(rows)),
            renderComplete: () => this.update(),
            invalidOptionWarnings: false
        };

        const table = new Tabulator(`#${options.tableId}`, tabulatorOptions);

        return table;
    }

    recalculateHeight(options) {
        if (options.pageMode === 'scrolling') {
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
        } else if (options.pageMode === 'paged') {
            this.table.setHeight('100%');
        }
    }

    recalculateWidth() {
        const tableHolder = first(this.table.element.getElementsByClassName('tabulator-tableHolder'));

        const tableWidth = tableHolder ? tableHolder.clientWidth : 0;
        const tableOffsetWidth = tableHolder ? tableHolder.offsetWidth : 0;

        const columnsWidth = this.table.columnManager.getWidth();

        if (columnsWidth < tableWidth || inRange(columnsWidth, tableOffsetWidth - 2, tableOffsetWidth + 2)) {
            const columns = filter(reject(this.table.getColumns(), column => !!column.getDefinition().width), column =>
                column.getVisibility()
            );
            const toAddPx = (tableWidth - columnsWidth) / columns.length;

            each(columns, column => column._column.setWidthActual(column._column.getWidth() + toAddPx));
        }
    }

    setSelectedRow(row) {
        if (!this.table) {
            return;
        }

        if (this.addRemoveRowControl) {
            this.addRemoveRowControl.setSelectedRow(row);
        }

        if (row) {
            const rowPosition = row.getPosition();
            const rowData = map(row.getCells(), cell => cell.getValue());

            const getCell = (cell, cellIndex) => ({
                rowData: rowData,
                value: cell.getValue(),
                element: cell.getElement(),
                displayPosition: { row: rowPosition, column: cellIndex }
            });

            const cells = map(row.getCells(), getCell);

            $(this.table.element).trigger(SELECTION_CHANGED_EVENT, {
                selection: cells,
                activeCell: first(cells),
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

    createStateManager(gridOptions, columns, scenarios) {
        if (gridOptions.saveState) {
            const saveStateSuffix = map(columns, 'name').join('#');

            return createStateManager(gridOptions.tableId, saveStateSuffix);
        }
        return undefined;
    }

    createExportControl(headerToolbar, options) {
        if (!options.showExport) {
            return undefined;
        }
        new ExportCsv(this.table, headerToolbar, options);
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

        const setNamePosnsAndOptions = map(setNameAndPosns, setNameAndPosn => ({
            ...setNameAndPosn,
            options: get(indicesOptions, `${setNameAndPosn.name}.${setNameAndPosn.position}`, {
                id: `${setNameAndPosn.name}_${setNameAndPosn.position}`
            })
        }));

        const allScenarios = uniq([scenariosData.defaultScenario].concat(values(scenariosData.scenarios)));

        const indicesColumns = map(setNamePosnsAndOptions, setNameAndPosn => {
            const { name, options } = setNameAndPosn;
            const entity = schema.getEntity(name);
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = DataUtils.entityTypeIsNumber(displayEntity);

            const title = get(options, 'title', entity.getAbbreviation() || name);
            const getClass = () => {
                let classes = ['index'];
                if (isNumberEntity) {
                    classes = classes.concat('numeric');
                }
                return classes.join(' ');
            };
            let column = assign({}, setNameAndPosn.options, {
                title: escape(String(title)),
                field: options.id,
                cssClass: getClass(),
                formatter: cell => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue()),
                dataType: entity.getType(),
                elementType: displayEntity.getElementType(),
                labelsEntity: entity.getLabelsEntity(),
                name: name
            });

            if (gridOptions.columnFilter) {
                const getHeaderFilterFn = () => {
                    const columnFilter = chooseColumnFilter(column);
                    if (columnFilter) {
                        return (valueTxt, cellValue, rowData, params) => {
                            const label = SelectOptions.getLabel(schema, allScenarios, entity, cellValue);
                            return columnFilter(valueTxt, label, rowData, params);
                        };
                    }
                    return undefined;
                };

                column = assign(column, {
                    headerFilterPlaceholder: 'No filter',
                    headerFilter: !!gridOptions.columnFilter,
                    headerFilterFunc: getHeaderFilterFn()
                });
            }
            return column;
        });

        const columnsIds = [].concat(map(setNamePosnsAndOptions, 'options.id'), map(entitiesOptions, 'id'));

        const getRowDataForColumns = getRowData(columnsIds);

        const entitiesColumns = map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = DataUtils.entityTypeIsNumber(displayEntity);

            const columnScenario = get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);

            const setArrayElement = change =>
                columnScenario
                    .modify()
                    .setArrayElement(entityOptions.name, change)
                    .commit();
            const removeArrayElement = rowKey =>
                columnScenario
                    .modify()
                    .removeFromArray(entityOptions.name, rowKey)
                    .commit();

            const getRowKey = flowRight(
                rowData => {
                    const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                    return generateCompositeKey(
                        tableKeys,
                        setNameAndPosns,
                        allColumnIndices[columnNumber],
                        entityOptions
                    );
                },
                getRowDataForColumns
            );

            const saveValue = (rowData, value) => setArrayElement({ key: getRowKey(rowData), value: value });
            const removeValue = rowData => removeArrayElement(getRowKey(rowData));

            const checkboxFormatter = cell => {
                const checked =
                    String(cell.getValue()) === String(get(entityOptions, 'checkedValue', true)) ? 'checked' : '';
                const disabled = entityOptions.editable ? '' : 'disabled';
                return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
            };

            const defaultFormatter = cell => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue());

            const getFormatter = () => {
                if (entityOptions.render) {
                    return cell =>
                        entityOptions.render(cell.getValue(), 'display', getRowDataForColumns(cell.getData()));
                }

                if (entityOptions.editorType === EDITOR_TYPES.checkbox) {
                    return checkboxFormatter;
                } else {
                    return defaultFormatter;
                }
            };

            const checkboxCellClickHandler = (e, cell) => {
                const checkedValue = get(entityOptions, 'checkedValue', true);
                const uncheckedValue = get(entityOptions, 'uncheckedValue', false);
                const newValue = String(cell.getValue()) === String(checkedValue) ? uncheckedValue : checkedValue;
                cell.setValue(newValue);
            };

            const getCellClickHandler = () => {
                if (entityOptions.editorType === EDITOR_TYPES.checkbox) {
                    if (entityOptions.editable) {
                        return checkboxCellClickHandler;
                    }
                }
                return undefined;
            };

            const getEditorParams = () => {
                if (entityOptions.editorType === EDITOR_TYPES.select) {
                    let getOptions;
                    if (entityOptions.editorOptionsSet) {
                        getOptions = flow(
                            () =>
                                SelectOptions.generateSelectOptions(
                                    schema,
                                    [columnScenario],
                                    entityOptions.editorOptionsSet,
                                    columnScenario.getSet(entityOptions.editorOptionsSet)
                                ),
                            entityOptions.selectNull ? addSelectNull : identity
                        );
                    } else if (entityOptions.editorOptions) {
                        getOptions = flow(
                          entityOptions.editorOptions,
                          options =>
                            SelectOptions.generateSelectOptionsFromValues(
                              options,
                              isNumberEntity
                            ),
                          entityOptions.selectNull ? addSelectNull : identity
                        );
                    }

                    const getListItemFormatter = () => {
                        if (isNumberEntity) {
                            return (value, title) => `<div class="numeric">${title}</div>`;
                        }
                        return undefined;
                    };

                    return cell => ({
                        listItemFormatter: getListItemFormatter(),
                        values: map(getOptions(cell.getValue(), getRowKey(cell.getData())), option => ({
                            value: option.key,
                            label: option.value
                        }))
                    });
                }
                return undefined;
            };

            const validate = (cell, newValue) => {
                const data = cell.getData();
                const keys = getRowKey(data);

                // Perform entity validation first
                let result = insight.validation.EntityValidator.checkValue(entity, newValue, undefined, keys);

                if (result.isValid && typeof entityOptions.editorValidate === 'function') {
                    result = entityOptions.editorValidate.call(this, newValue, getRowDataForColumns(data), keys);
                }

                return result;
            };

            const validateAndStyle = (cell, newValue) => {
                const validationResult = validate(cell, newValue);

                const element = cell.getElement();
                if (!validationResult.isValid) {
                    element.classList.add('invalid');
                } else {
                    element.classList.remove('invalid');
                }

                return validationResult;
            };

            const title = get(entityOptions, 'title', entity.getAbbreviation() || name);

            const getCellEditingHandler = () => {
                if (entityOptions.editorType !== EDITOR_TYPES.select) {
                    return cell => {
                        const element = cell.getElement();
                        $(element).on('keyup', evt => {
                            validateAndStyle(cell, evt.target.value);
                        });
                    };
                }
                return undefined;
            };

            const getClasses = () => {
                let classes = [];
                if (isNumberEntity) {
                    classes = classes.concat('numeric');
                }
                if (entityOptions.editorType === EDITOR_TYPES.select) {
                    classes = classes.concat('select-editor');
                }
                return classes.join(' ');
            };

            let column = assign({}, entityOptions, {
                title: escape(String(title)),
                field: entityOptions.id,
                cssClass: getClasses(),
                cellClick: getCellClickHandler(),
                formatter: getFormatter(),
                editor: entityOptions.editorType,
                editorParams: getEditorParams(),
                cellEditing: getCellEditingHandler(),
                cellEdited: cell => {
                    $(cell.getElement()).off('keyup');

                    const oldValue = isUndefined(cell.getOldValue()) ? '' : cell.getOldValue();
                    const value = cell.getValue();

                    const validationResult = validateAndStyle(cell, value);

                    if (!validationResult.isValid && !validationResult.allowSave) {
                        cell.restoreOldValue();
                        validateAndStyle(cell, cell.getValue());
                        dialogs.alert(validationResult.errorMessage, VALIDATION_ERROR_TITLE, () => {
                            defer(() => cell.edit(true));
                        });
                    } else {
                        if (value !== oldValue) {
                            if (isUndefined(value) || value === '') {
                                removeValue(cell.getData()).catch(err => {
                                    cell.restoreOldValue();
                                    // TODO: message saying
                                    // Could not save new value (4.444444444444444e+37) for entity FactoryDemand, indices [New York,January]. The display value will be reverted.
                                });
                            } else {
                                saveValue(cell.getData(), value).catch(err => {
                                    cell.restoreOldValue();
                                    // TODO: message saying
                                    // Could not save new value (4.444444444444444e+37) for entity FactoryDemand, indices [New York,January]. The display value will be reverted.
                                });
                            }
                        }
                    }
                },

                cellEditCancelled: cell => {
                    $(cell.getElement()).off('keyup');
                    const value = cell.getValue();

                    const validationResult = validateAndStyle(cell, value);
                },
                dataType: entity.getType(),
                elementType: displayEntity.getElementType(),
                scenario: columnScenario,
                getRowKey: getRowKey,
                validate: validateAndStyle
            });

            if (gridOptions.columnFilter) {
                const getHeaderFilter = () => {
                    if (column.editor === EDITOR_TYPES.checkbox) {
                        return EDITOR_TYPES.select;
                    }
                    return EDITOR_TYPES.text;
                };
                const getHeaderFilterParams = () => {
                    if (column.editor === EDITOR_TYPES.checkbox) {
                        const checkedValue = get(entityOptions, 'checkedValue', true);
                        const uncheckedValue = get(entityOptions, 'uncheckedValue', false);
                        return {
                            values: [
                                { value: undefined, label: 'No Filter' },
                                { value: String(checkedValue), label: 'Checked' },
                                { value: String(uncheckedValue), label: 'Unchecked' }
                            ]
                        };
                    }
                };
                const headerFilter = getHeaderFilter();
                const headerFilterParams = getHeaderFilterParams();
                const checkboxFilterFunc = (value, cellValue, rowData, params) => {
                    const valueString = String(value);
                    const cellValueTxt = String(cellValue);
                    if (valueString === cellValueTxt) {
                        return true;
                    }

                    const optionMatch = find(
                        params.values,
                        keyValue => keyValue.value === valueString || keyValue.label === valueString
                    );
                    if (isUndefined(optionMatch)) {
                        return false;
                    }
                    return optionMatch.value === cellValueTxt;
                };

                const checkboxFilterEmptyCheck = value => {
                    if (value == null) {
                        return true;
                    }
                    const valueString = String(value);
                    const optionMatch = find(
                        headerFilterParams.values,
                        keyValue => keyValue.value === valueString || keyValue.label === valueString
                    );
                    return isUndefined(optionMatch) || isUndefined(optionMatch.value);
                };

                const getHeaderFilterEmptyCheckFn = () => {
                    if (column.editor === EDITOR_TYPES.checkbox) {
                        return checkboxFilterEmptyCheck;
                    }
                    return undefined;
                };
                const getHeaderFilterFn = () => {
                    if (column.editor === EDITOR_TYPES.checkbox) {
                        return checkboxFilterFunc;
                    }
                    const columnFilter = chooseColumnFilter(column);

                    if (isUndefined(columnFilter)) {
                        return undefined;
                    }

                    return (valueTxt, cellValue, rowData, params) => {
                        let formattedCellValue;
                        if (entityOptions.render) {
                            formattedCellValue = entityOptions.render(
                                cellValue,
                                'filter',
                                getRowDataForColumns(rowData)
                            );
                        } else {
                            formattedCellValue = SelectOptions.getLabel(schema, allScenarios, entity, cellValue);
                        }
                        return columnFilter(valueTxt, formattedCellValue, rowData, params);
                    };
                };

                column = assign(column, {
                    headerFilterPlaceholder: 'No filter',
                    headerFilter: headerFilter,
                    headerFilterParams: headerFilterParams,
                    headerFilterFuncParams: headerFilterParams,
                    headerFilterFunc: getHeaderFilterFn(),
                    headerFilterEmptyCheck: getHeaderFilterEmptyCheckFn()
                });
            }

            return column;
        });

        let columns = [].concat(indicesColumns, entitiesColumns);

        let freezeColumns = parseInt(gridOptions.freezeColumns);
        if (freezeColumns && !isNaN(freezeColumns)) {
            columns = map(columns, function(col, idx) {
                if (idx < freezeColumns) {
                    col.frozen = true;
                }
                return col;
            });
        }

        const { data, allSetValues } = perf('PERF Data generation:', () =>
            dataTransform(
                allColumnIndices,
                columns,
                entitiesColumns,
                setNamePosnsAndOptions,
                scenariosData,
                gridOptions.rowFilter
            )
        );

        const editable = some(reject(entitiesOptions, options => !get(options, 'visible', true)), 'editable');
        if (!editable && gridOptions.addRemoveRow) {
            console.log(
                `vdl-table (${gridOptions.tableId}): add/remove rows disabled. Table needs to have at least one editable column to use this feature.`
            );
        }
        const addRemoveRow = editable && gridOptions.addRemoveRow;
        this.updateAddRemoveControl(
            addRemoveRow,
            indicesColumns,
            entitiesColumns,
            scenariosData.defaultScenario,
            allSetValues,
            data
        );
        this.entitiesColumns = entitiesColumns;
        this.indicesColumns = indicesColumns;

        table.setColumns(columns);

        this.stateManager = this.createStateManager(gridOptions, columns, map(entitiesColumns, 'scenario'));
        this.loadState();

        const redraw = () => {
            if (this.table.element.offsetParent) {
                return Promise.resolve(this.table.redraw(true));
            } else {
                return new Promise((resolve, reject) => {
                    delay(() => {
                        redraw()
                            .then(resolve)
                            .catch(reject);
                    }, 100);
                });
            }
        };
        return perf('PERF Tabulator.setData():', () =>
            table
                .setData(data)
                .then(() => redraw())
                .catch(err => {
                    debugger;
                })
        );
    }

    validate() {
        const editableColumns = filter(this.entitiesColumns, 'editable');
        each(editableColumns, column => {
            const cells = this.table.columnManager.columnsByField[column.field].cells;
            each(cells, cell => {
                column.validate(cell.getComponent(), cell.getValue());
            });
        });
    }

    dispose() {
        /// TODO - debug and check button is destroyed
        this.table.destroy();
        each(this.subscriptions, subscription => subscription.dispose());
    }
}

export default Datagrid;
