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
// import {Tabulator, SortModule, FilterModule, EditModule, FormatModule} from 'tabulator-tables';
// Tabulator.registerModule([SortModule, FilterModule, EditModule, FormatModule]);
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import {createFormattedSorter, getSetSorter, getSorter} from './datagrid-sorter';
import dataTransform, {
    generateCompositeKey,
    getAllColumnIndices,
    getDisplayIndices,
    getPartialExposedKey,
} from './data-transform';
import withScenarioData from './data-loader';
import exportCsv from './export-csv';
import Paginator from './paginator';
import {getRowData} from './utils';
import {EDITOR_TYPES} from '../constants';
import AddRemove from './add-remove';
import {chooseColumnFilter} from './grid-filters';
import {perf, perfMessage} from '../performance-measurement';
import {createStateManager} from './state-persistence';
import {DatagridLock} from './datagrid-lock';
import escape from 'lodash/escape';
import delay from 'lodash/delay';
import some from 'lodash/some';
import defer from 'lodash/defer';
import isUndefined from 'lodash/isUndefined';
import identity from 'lodash/identity';
import flow from 'lodash/flow';
import flowRight from 'lodash/flowRight';
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
import isObject from 'lodash/isObject';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import constant from 'lodash/constant';
import {withEquals} from '../ko-utils';
import keys from 'lodash/keys';
import {dataUtils, dialogs, enums, insightGetter, ko, SelectOptions} from '../insight-modules';
import reverse from 'lodash/reverse';
import {createCustomConfig} from "./custom-data/create-custom-config";
import {
    checkboxFilterFunc,
    FILTER_PLACEHOLDER_TEXT,
    getHeaderFilterEmptyCheckFn,
    getHeaderFilterParams
} from './column-filter-utils';
import {createCustomColumnSortOrder} from "./custom-data/custom-column-utils";

const SELECTION_CHANGED_EVENT = 'selection-changed';
const SELECTION_REMOVED_EVENT = 'selection-removed';

const addSelectNull = (items) => {
    if (isArray(items)) {
        // add empty option to the start of the list
        return [{value: '&nbsp'}].concat(items);
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

/**
 * Generate the CSS class string for an index or array column.
 *
 * @param {object} columnOptions
 * @param {string} [columnOptions.editorType] Editor type of the column, if an array column
 * @param {string} [columnOptions.style] User-defined style for the column
 * @param {boolean} isNumeric
 * @param {boolean} [isIndex]
 * @returns {string} The CSS style string. Space-separated list of class names
 */
export const getCssClasses = (columnOptions, isNumeric, isIndex = false) => {
    let classes = isIndex ? ['index'] : [];
    if (isNumeric) {
        classes.push('numeric');
    }
    if (columnOptions.editorType === EDITOR_TYPES.list) {
        classes.push('select-editor');
    }
    if (columnOptions.style) {
        classes = classes.concat(String(columnOptions.style).trim().split(/\s+/));
    }
    return classes.join(' ');
};

const VALIDATION_ERROR_TITLE = 'Validation Error';

class Datagrid {
    /**
     *
     * @param {Element} root
     * @param {KnockoutObservable} gridOptions$
     * @param {KnockoutObservable} columnOptions$
     * @param {KnockoutObservable} filters$
     */
    constructor(root, gridOptions$, columnOptions$, filters$) {
        /** @type {Array<KnockoutSubscription>} */
        this.subscriptions = [];

        this.entitiesColumns = undefined;
        this.indicesColumns = undefined;

        this.gridOptions$ = gridOptions$;
        this.columnOptions$ = columnOptions$;
        this.filters$ = filters$;

        this.componentRoot = root;
        this.view = insightGetter().getView();
        this.schema = this.view.getApp().getModelSchema();

        const options = ko.unwrap(gridOptions$);

        this.table = this.createTable(options);
        this.tableLock = new DatagridLock(this.table.element);

        let rowIndex = 1;
        this.getRowIndex = () => rowIndex++;

        this.headerToolbar = root.querySelector('.header-toolbar');
        const footerToolbar = root.querySelector('.footer-toolbar');

        this.addRemoveRowControl = this.createAddRemoveRowControl(footerToolbar, options);
        this.paginatorControl = this.createPaginatorControl(footerToolbar, this.table, options);
        this.stateManager = null;
        this.isTableBuilt = false;
        this.stateLoaded = false;

        this.table.on("tableBuilt", () => {
            if (_.isUndefined(options.data)) {
                this.buildTable();
            } else {
                this.buildCustomDataTable();
            }

            this.isTableBuilt = true;

            const mouseDownListener = (e) => {
                if (!root.contains(e.target)) {
                    if (!isEmpty(this.table.getSelectedRows()) && !options.alwaysShowSelection) {
                        this.table.deselectRow();
                    }
                }
            };
            document.addEventListener('mousedown', mouseDownListener);

            this.subscriptions = this.subscriptions.concat([
                {
                    dispose: () => {
                        document.removeEventListener('mousedown', mouseDownListener);
                    },
                },
            ]);

            this.unloadHandlerId = null;
            this.savingPromise = Promise.resolve();

            this.viewUnloadHandler = () => {
                return Promise.resolve(this.savingPromise).catch((err) => dialogs.toast(err.message, dialogs.level.ERROR));
            };

            this.unloadHandlerId = this.view.addUnloadHandler(this.viewUnloadHandler);
        });
    }

    // stripped down version of build table that only subscribes to grid options
    buildCustomDataTable() {
        const gridOptions$ = this.gridOptions$;

        this.subscriptions = this.subscriptions.concat([
            ko
                .pureComputed(() => {
                    const gridOptions = gridOptions$();
                    if (gridOptions) {
                        this.componentRoot.style.display = 'block';
                        // lock table until updated
                        if (!isEmpty(gridOptions)) {
                            this.tableLock.lock();
                        }

                        return perf('vdlx-datagrid custom data total build time:', () =>
                            this.setCustomDataColumnsAndData(gridOptions).then(() => {
                                this.tableLock.unlock();
                            }).catch((err) => {
                                this.tableLock.unlock()
                                this.table.clearData();
                                this.table.setColumns([]);
                                dialogs.toast(err, dialogs.level.ERROR);
                                console.error('An error occurred whilst adding data to Tabulator', err);
                            })
                        );
                    }
                    return undefined;
                    // throttling table updates
                }).extend({ throttle: 500 })
                .subscribe(noop)
        ]);
    }

    setCustomDataColumnsAndData(gridOptions) {
        const table = this.table;
        this.stateLoaded = false;

        if (!isArray(gridOptions.data())) {
            return Promise.reject('Error for component vdlx-datagrid: Please ensure the data attribute contains an array');
        }

        let config = {};
        try {
            config = createCustomConfig(gridOptions);
        } catch (err) {
            return Promise.reject(err);
        }

        if (!_.isUndefined(config.columns)) {

            // set the columns
            table.setColumns(config.columns);

            // set the sort order
            const sortOrder = createCustomColumnSortOrder(config.columns);

            if (isEmpty(this.initialSortOrder)) {
                this.initialSortOrder = sortOrder;
            }

            this.stateManager = this.createStateManager(gridOptions, config.columns);

            return perf('Tabulator set custom Data and draw', () =>
                table
                    .setData(config.data)
                    .then(() => this.redrawTable())
                    .then(() => {
                        // clear the filters
                        if (gridOptions.saveState) {
                            this.table.setSort(cloneDeep(this.initialSortOrder));
                            this.loadState();
                        } else {
                            table.setSort(sortOrder);
                            this.table.clearHeaderFilter();
                        }
                        this.table.element.style.visibility = 'visible';
                    })
                    .catch((e) => {
                        console.error('An error occurred whilst adding custom data to Tabulator and redrawing', e);
                    })
            );

        }
    }

    buildTable() {
        const columnOptions$ = this.columnOptions$;
        const gridOptions$ = this.gridOptions$;
        const filters$ = this.filters$;
        const {data: scenariosData$, errors: errors$} = withScenarioData(columnOptions$, filters$);

        const allOptions$ = withEquals(
            ko.pureComputed(() => {
                if (!gridOptions$() || !columnOptions$() || !scenariosData$()) {
                    return allOptions$.peek();
                }
                if (!isEqual(map(columnOptions$().columnOptions, 'id'), keys(scenariosData$().scenarios))) {
                    return allOptions$.peek();
                }
                return {
                    gridOptions: gridOptions$(),
                    columnOptions: columnOptions$(),
                    scenariosData: scenariosData$(),
                };
            })
        );

        this.subscriptions = this.subscriptions.concat([
            ko
                .pureComputed(() => {
                    if (errors$()) {
                        this.componentRoot.style.display = 'none';
                    } else {
                        this.componentRoot.style.display = 'block';
                    }
                })
                .subscribe(noop),
            ko
                .pureComputed(() => {
                    const allOptions = allOptions$();
                    if (allOptions) {
                        const {gridOptions, columnOptions, scenariosData} = allOptions;

                        if (!isEmpty(get(columnOptions, 'columnOptions'))) {
                            this.tableLock.lock();
                        }

                        return perf('vdlx-datagrid total build time:', () =>
                            this.setColumnsAndData(gridOptions, columnOptions, scenariosData).then(() => {
                                this.tableLock.unlock();
                            })
                        );
                    }
                    return undefined;
                })
                // Reduce table redraws with a throttle
                .extend({throttle: 50})
                .subscribe(noop),
        ]);
    }

    updateLayout() {
        if (this.table && this.isTableBuilt) {
            this.recalculateWidth();
            this.validate();
            this.updatePaginator();
            const gridOptions = ko.unwrap(this.gridOptions$);
            if (gridOptions) {
                this.exportControl = this.updateExportControl(this.table, this.headerToolbar, gridOptions);
            }
        }
    }

    saveState() {
        if (this.stateManager && this.stateLoaded) {
            let sorters = map(this.table.getSorters(), (sorter) => ({dir: sorter.dir, column: sorter.field}));
            if (isEqual(this.initialSortOrder, sorters)) {
                sorters = [];
            }
            const state = {
                filters: this.table.getHeaderFilters(),
                sorters: sorters,
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
                    each(state.filters, (filter) => {
                        const column = this.table.getColumn(filter.field);
                        if (!column) {
                            return;
                        }

                        this.table.setHeaderFilterValue(filter.field, filter.value);
                    });
                }
            }
        }
        this.stateLoaded = true;
    }

    createTable(options) {
        const select = (row) => {
            each(
                filter(this.table.getSelectedRows(), (selectedRow) => selectedRow.getPosition() !== row.getPosition()),
                (selectedRow) => selectedRow.deselect()
            );

            if (!row.isSelected()) {
                row.select();
            }
        };
        const saveState = () => this.saveState();

        let sortPromise = Promise.resolve();
        let sortPromiseResolve = noop;

        const tabulatorOptions = {
            pagination: !!options.pagination,
            paginationMode: options.pagination,
            paginationSize: options.paginationSize,
            paginationElement: options.paginationElement,
            layout: 'fitDataFill',
            placeholder: 'No data available',
            groupStartOpen: false,
            dataLoader: true,
            columnDefaults: {
                resizable: 'false',
                debugInvalidOptions: false,
            },
            debugInvalidOptions: false,
        };
        if(!options.pagination){
            tabulatorOptions.maxHeight = options.gridHeight
        }

        const table = new Tabulator(`#${options.tableId}`, tabulatorOptions);

        table.on('dataFiltered', saveState);
        table.on('dataSorting', () => {
            const lockedBeforeSort = this.tableLock && this.tableLock.isLocked();
            this.tableLock && this.tableLock.lock();
            sortPromise = new Promise((resolve) => {
                sortPromiseResolve = resolve;
            });
            perf('datagrid sorting', constant(sortPromise));
            if (!lockedBeforeSort) {
                saveState();
            }
        });
        table.on('dataSorted', () => {
            sortPromiseResolve();
            this.tableLock && this.tableLock.unlock();
        });
        table.on('cellEditing', (cell) => select(cell.getRow()));
        table.on('rowClick', (e, row) => select(row));
        table.on('rowSelectionChanged', (data, rows) => this.setSelectedRow(first(rows)));
        table.on('renderComplete', () => this.updateLayout());

        return table
    }

    recalculateWidth() {
        const tableHolder = first(this.table.element.getElementsByClassName('tabulator-tableholder'));

        const tableWidth = tableHolder ? tableHolder.clientWidth : 0;
        const tableOffsetWidth = tableHolder ? tableHolder.offsetWidth : 0;

        const columnsWidth = this.table.columnManager.getWidth();

        if (columnsWidth < tableWidth || inRange(columnsWidth, tableOffsetWidth - 2, tableOffsetWidth + 2)) {
            const columns = filter(
                reject(this.table.getColumns(), (column) => !!column.getDefinition().width),
                (column) => column.isVisible()
            );
            const toAddPx = (tableWidth - columnsWidth) / columns.length;
            each(columns, (column) => column.setWidth(column.getWidth() + toAddPx));
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
            const rowData = map(row.getCells(), (cell) => cell.getValue());

            const getCell = (cell, cellIndex) => ({
                rowData: rowData,
                value: cell.getValue(),
                element: cell.getElement(),
                displayPosition: {row: rowPosition, column: cellIndex},
            });

            const cells = map(row.getCells(), getCell);

            $(this.table.element).trigger(SELECTION_CHANGED_EVENT, {
                selection: cells,
                activeCell: first(cells),
                selectionType: 'ROW',
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

    updateExportControl(table, headerToolbar, options) {
        if (this.exportControl) {
            this.exportControl.dispose();
        }

        if (options.showExport) {
            const rowCount = table.getDataCount('active');
            return exportCsv(table, headerToolbar, {
                enabled: rowCount > 0,
                filename: options.exportFilename,
            });
        }
    }

    /**
     * @param {Element} footerToolbar
     * @param {*} options
     * @returns
     * @memberof Datagrid
     */
    createAddRemoveRowControl(footerToolbar, options) {
        if (!options.addRemoveRow) {
            return undefined;
        }

        const addRemoveControl = new AddRemove(this.table, this.getRowIndex, options.addRemoveRow === 'addrow-autoinc');
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
            // Dismiss add row dialog if open on table update
            this.addRemoveRowControl.dismiss();
            this.addRemoveRowControl.setEnabled(enabled);
            this.addRemoveRowControl.update(indicesColumns, entitiesColumns, defaultScenario, allSetValues, data);
        }
    }

    redrawTable() {
        if (this.table.element.offsetParent &&
            _.includes(['vdlx-datagrid', 'vdlx-pivotgrid'], this.table.element.offsetParent.tagName.toLowerCase())
        ) {
            return Promise.resolve(this.table.redraw(true));
        } else {
            return new Promise((resolve, reject) => {
                delay(() => {
                    this.redrawTable().then(resolve).catch(reject);
                }, 100);
            });
        }
    }

    cancelPendingEdits() {
        let editingCell = this.table?.modules?.edit?.getCurrentCell();
        if (editingCell) {
            editingCell.cancelEdit();
        }
    }

    setColumnsAndData(gridOptions, columnOptions, scenariosData) {
        const table = this.table;
        const schema = this.schema;
        const indicesOptions = columnOptions.indicesOptions;
        this.stateLoaded = false;

        this.cancelPendingEdits();

        const entitiesOptions = map(columnOptions.columnOptions, (options) => {
            return {
                ...options,
                editable:
                    options.editable &&
                    get(scenariosData.scenarios, options.id, scenariosData.defaultScenario).isEditable(),
            };
        });

        const calculatedColumnsOptions = columnOptions.calculatedColumnsOptions;
        const allColumnIndices = getAllColumnIndices(schema, entitiesOptions);

        const setNameAndPosns = getDisplayIndices(allColumnIndices, entitiesOptions);

        const setNamePosnsAndOptions = map(setNameAndPosns, (setNameAndPosn) => ({
            ...setNameAndPosn,
            options: get(indicesOptions, `${setNameAndPosn.name}.${setNameAndPosn.position}`, {
                id: `${setNameAndPosn.name}_${setNameAndPosn.position}`,
            }),
        }));

        const allScenarios = uniq([scenariosData.defaultScenario].concat(values(scenariosData.scenarios)));

        const indicesColumns = map(setNamePosnsAndOptions, (setNameAndPosn) => {
            const {name, options} = setNameAndPosn;
            const entity = schema.getEntity(name);
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = dataUtils.entityTypeIsNumber(displayEntity);

            const title = get(options, 'title', entity.getAbbreviation() || name);
            const defaultFormatter = (cell) => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue());

            const getFormatter = (type = 'display') => {
                if (options.render) {
                    return (cell) => options.render(cell.getValue(), type, getRowDataForColumns(cell.getData()));
                }
                return defaultFormatter;
            };

            let column = {
                ...setNameAndPosn.options,
                title: escape(String(title)),
                field: options.id,
                cssClass: getCssClasses(options, isNumberEntity, true),
                formatter: getFormatter(),
                sorter: options.sortByFormatted
                    ? createFormattedSorter(options.id, getFormatter('sort'))
                    : options.disableSetSorting
                        ? getSorter(entity)
                        : getSetSorter(entity),
                filterByFormatted: options.filterByFormatted,
                dataType: entity.getType(),
                elementType: displayEntity.getElementType(),
                labelsEntity: entity.getLabelsEntity(),
                name: name,
            };

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

                column = {
                    ...column,
                    headerFilterPlaceholder: FILTER_PLACEHOLDER_TEXT,
                    headerFilter: !!gridOptions.columnFilter,
                    headerFilterFunc: getHeaderFilterFn(),
                };
            }
            return column;
        });

        const columnsIds = [].concat(map(setNamePosnsAndOptions, 'options.id'), map(entitiesOptions, 'id'));

        const getRowDataForColumns = getRowData(columnsIds);

        const entitiesColumns = map(entitiesOptions, (entityOptions, columnNumber) => {
            const entity = schema.getEntity(entityOptions.name);
            const displayEntity = resolveDisplayEntity(schema, entity);
            const isNumberEntity = dataUtils.entityTypeIsNumber(displayEntity);

            const columnScenario = get(scenariosData.scenarios, entityOptions.id, scenariosData.defaultScenario);

            const setArrayElement = (change) =>
                columnScenario.modify().setArrayElement(entityOptions.name, change).commit();
            const removeArrayElement = (rowKey) =>
                columnScenario.modify().removeFromArray(entityOptions.name, rowKey).commit();

            const getRowKey = flowRight((rowData) => {
                const tableKeys = getPartialExposedKey(setNameAndPosns, rowData);
                return generateCompositeKey(tableKeys, setNameAndPosns, allColumnIndices[columnNumber], entityOptions);
            }, getRowDataForColumns);

            const saveValue = (rowData, value) => setArrayElement({key: getRowKey(rowData), value: value});
            const removeValue = (rowData) => removeArrayElement(getRowKey(rowData));

            const checkboxFormatter = (cell) => {
                const checked =
                    String(cell.getValue()) === String(get(entityOptions, 'checkedValue', true)) ? 'checked' : '';
                const disabled = entityOptions.editable ? '' : 'disabled';
                return `<div class="checkbox-editor"><input type="checkbox" ${checked} ${disabled}/></div>`;
            };

            const defaultFormatter = (cell) => SelectOptions.getLabel(schema, allScenarios, entity, cell.getValue());

            const getFormatter = (type = 'display') => {
                if (entityOptions.render) {
                    return (cell) => entityOptions.render(cell.getValue(), type, getRowDataForColumns(cell.getData()));
                }

                if (entityOptions.editorType === EDITOR_TYPES.checkbox && type === 'display') {
                    return checkboxFormatter;
                }

                return defaultFormatter;
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

            const getCellDoubleClickHandler = (e, cell) => {
                if (entityOptions.editorType === EDITOR_TYPES.text) {
                    if (entityOptions.editable && !cell.getElement().classList.contains('tabulator-editing')) {
                        cell.edit(true);
                    }
                }
            };

            const getEditorParams = () => {
                if (entityOptions.editorType === EDITOR_TYPES.list) {
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
                            (options) => SelectOptions.generateSelectOptionsFromValues(options, isNumberEntity),
                            entityOptions.selectNull ? addSelectNull : identity
                        );
                    }

                    let itemFormatter
                    if (isNumberEntity) {
                        itemFormatter = (label, value) => `<div class="numeric">${label}</div>`;
                    }

                    return (cell) => ({
                        emptyValue: cell.getValue(),
                        itemFormatter,
                        values: map(getOptions(cell.getValue(), getRowKey(cell.getData())), (option) => ({
                            value: option.key,
                            label: option.value,
                        })),
                    });
                }
                return undefined;
            };

            const validate = (cell, newValue) => {
                const data = cell.getData();
                const keys = getRowKey(data);

                // Perform entity validation first
                let result = insightGetter().validation.EntityValidator.checkValue(entity, newValue, undefined, keys);

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
                if (entityOptions.editorType !== EDITOR_TYPES.list) {
                    return (cell) => {
                        const element = cell.getElement();
                        $(element).on('keyup', (evt) => {
                            validateAndStyle(cell, evt.target.value);
                        });
                    };
                }
                return undefined;
            };

            const cellEdited = async (cell) => {
                $(cell.getElement()).off('keyup');
                const oldValue = isUndefined(cell.getOldValue()) ? '' : cell.getOldValue();
                const value = cell.getValue();
                const validationResult = validateAndStyle(cell, value);

                if (value !== String(oldValue)) {
                    if (!validationResult.isValid && !validationResult.allowSave) {
                        cell.restoreOldValue();
                        validateAndStyle(cell, cell.getValue());
                        dialogs.alert(validationResult.errorMessage, VALIDATION_ERROR_TITLE, () => {
                            defer(() => {
                                // Check the cell element still exists, the validation dialog can be invoked when the table redraws
                                if (cell.getElement()) {
                                    cell.edit(true)
                                }
                            });
                        });
                        this.savingPromise = Promise.reject({message: validationResult.errorMessage});
                    } else {
                        if (isUndefined(value) || value === '') {
                            this.savingPromise = removeValue(cell.getData()).catch((err) => {
                                cell.restoreOldValue();
                                validateAndStyle(cell, cell.getValue());
                                // TODO: message saying
                                // Could not save new value (4.444444444444444e+37) for entity FactoryDemand, indices [New York,January]. The display value will be reverted.
                            });
                        } else {
                            this.savingPromise = saveValue(cell.getData(), value).catch((err) => {
                                cell.restoreOldValue();
                                validateAndStyle(cell, cell.getValue());
                                // TODO: message saying
                                // Could not save new value (4.444444444444444e+37) for entity FactoryDemand, indices [New York,January]. The display value will be reverted.
                            });
                        }

                        if (calculatedColumnsOptions.length > 0) {
                            await this.savingPromise;
                            return this.redrawTable();
                        }
                    }
                }
            };

            const cellEditCancelled = (cell) => {
                $(cell.getElement()).off('keyup');
                const value = cell.getValue();
                const validationResult = validateAndStyle(cell, value);
            };

            let column = {
                ...entityOptions,
                title: escape(String(title)),
                field: entityOptions.id,
                cssClass: getCssClasses(entityOptions, isNumberEntity),
                cellClick: getCellClickHandler(),
                cellDblClick: getCellDoubleClickHandler,
                formatter: getFormatter(),
                sortByFormatted: entityOptions.sortByFormatted,
                filterByFormatted: entityOptions.filterByFormatted,
                sorter: entityOptions.sortByFormatted
                    ? createFormattedSorter(entityOptions.id, getFormatter('sort'))
                    : getSorter(entity),
                editor: entityOptions.editorType,
                editorParams: getEditorParams(),
                cellEditing: getCellEditingHandler(),
                cellEdited: cellEdited,
                cellEditCancelled: cellEditCancelled,
                dataType: entity.getType(),
                elementType: displayEntity.getElementType(),
                scenario: columnScenario,
                getRowKey: getRowKey,
                validate: validateAndStyle,
            };

            if (gridOptions.columnFilter) {
                const getHeaderFilter = () => {
                    if (column.editor === EDITOR_TYPES.checkbox) {
                        return EDITOR_TYPES.list;
                    }
                    return EDITOR_TYPES.text;
                };
                const headerFilter = getHeaderFilter();
                const headerFilterParams = getHeaderFilterParams(column, entityOptions);
                const headerFilterEmptyCheck = getHeaderFilterEmptyCheckFn(column, headerFilterParams);


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

                column = {
                    ...column,
                    headerFilterPlaceholder: FILTER_PLACEHOLDER_TEXT,
                    headerFilter: headerFilter,
                    headerFilterParams: headerFilterParams,
                    headerFilterFuncParams: headerFilterParams,
                    headerFilterFunc: getHeaderFilterFn(),
                    headerFilterEmptyCheck: headerFilterEmptyCheck,
                };
            }

            return column;
        });

        const calculatedColumns = map(calculatedColumnsOptions, (options) => {
            const title = get(options, 'title', options.name);

            const getFormatter = (type = 'display') => (cell) =>
                options.render(cell.getValue(), type, getRowDataForColumns(cell.getData()));

            let column = {
                ...options,
                title: escape(String(title)),
                formatter: getFormatter(),
                name: options.name,
                field: options.id,
                cssClass: getCssClasses(options, false),
                elementType: enums.DataType.STRING,
                sortByFormatted: true,
                filterByFormatted: true,
                sorter: createFormattedSorter(options.id, getFormatter('sort')),
                accessorDownload: (value, rowData) => options.render(value, 'display', getRowDataForColumns(rowData)),
            };

            if (gridOptions.columnFilter) {
                const getHeaderFilterFn = () => {
                    const columnFilter = chooseColumnFilter(column);
                    if (columnFilter) {
                        return (valueTxt, cellValue, rowData, params) => {
                            var value = column.render(cellValue, 'filter', getRowDataForColumns(rowData));
                            return columnFilter(valueTxt, value, rowData, params);
                        };
                    }
                    return undefined;
                };

                column = {
                    ...column,
                    headerFilterPlaceholder: FILTER_PLACEHOLDER_TEXT,
                    headerFilter: !!gridOptions.columnFilter,
                    headerFilterFunc: getHeaderFilterFn(),
                };
            }

            return column;
        });

        let columns = sortBy(
            [].concat(indicesColumns, entitiesColumns, calculatedColumns),
            (column) => column.index || -1
        );

        let freezeColumns = parseInt(gridOptions.freezeColumns);
        if (freezeColumns && !isNaN(freezeColumns)) {
            columns = map(columns, function (col, idx) {
                if (idx < freezeColumns) {
                    col.frozen = true;
                }
                return col;
            });
        }

        const {data, allSetValues} = perf('Data generation:', () =>
            dataTransform(
                allColumnIndices,
                columns,
                entitiesColumns,
                setNamePosnsAndOptions,
                scenariosData,
                gridOptions.rowFilter,
                this.getRowIndex
            )
        );

        const editable = some(
            reject(entitiesOptions, (options) => !get(options, 'visible', true)),
            'editable'
        );
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

        this.initialSortOrder = map(
            sortBy(
                filter(columns, (column) => !isUndefined(column.sortOrder)),
                'sortOrder'
            ),
            (column) => ({
                column: column.id,
                dir: column.sortDirection,
            })
        );

        if (isEmpty(this.initialSortOrder)) {
            console.debug(
                'No initial column sort order. Going to apply sort order onto index columns, except where disable-set-sorting is specified.'
            );
            this.initialSortOrder = reverse(
                map(
                    filter(columns, (c) => c.dataType === enums.DataType.SET && !c.disableSetSorting),
                    (column) => ({
                        column: column.id,
                        dir: 'asc',
                    })
                )
            );
        }

        this.table.setSort(cloneDeep(this.initialSortOrder));

        this.stateManager = this.createStateManager(gridOptions, columns, map(entitiesColumns, 'scenario'));


        this.table.element.style.visibility = 'hidden';

        perfMessage(() => {
            if (isArray(data) && isObject(data[0])) {
                let columnCount = Object.keys(data[0]).length - 1;
                let rowCount = data.length;
                let cellCount = rowCount * columnCount;
                return `vdlx-datagrid going to render with ${rowCount.toLocaleString()} rows, ${columnCount} columns, ${cellCount.toLocaleString()} cells`;
            }
        });

        return perf('Tabulator setData and draw', () =>
            table
                .setData(data)
                .then(() => {
                    this.loadState();
                    this.table.element.style.visibility = 'visible';
                })
                .catch((e) => {
                    console.error('An error occurred whilst adding data to Tabulator and redrawing', e);
                })
        );
    }

    validate() {
        const editableColumns = filter(this.entitiesColumns, 'editable');
        each(editableColumns, (column) => {
            const cells = this.table.columnManager.getColumnByField(column.field).cells;
            each(cells, (cell) => {
                column.validate(cell.getComponent(), cell.getValue());
            });
        });
    }

    dispose() {
        this.view.removeUnloadHandler(this.unloadHandlerId);
        this.table.destroy();
        each(this.subscriptions, (subscription) => subscription.dispose());
    }
}

export default Datagrid;
