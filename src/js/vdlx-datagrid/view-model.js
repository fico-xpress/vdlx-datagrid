/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/view-model.js
   ```````````````````````
   vdlx-datagrid VDL extension view model.

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
import Datagrid from './datagrid';
import { withDeepEquals } from './ko-utils';

import { $ } from '../globals';
import {
    isNaN,
    isNull,
    isUndefined,
    partialRight,
    pickBy,
    flow,
    identity,
    negate,
    bindKey,
    get,
    isFunction,
    cloneDeep,
    isPlainObject,
    uniqueId,
    clone,
    forEach,
    isNumber,
    omitBy,
    has,
    range,
    isEmpty,
    defer,
    parseInt
} from 'lodash';
import _ from 'lodash';

const DEFAULT_GRID_PAGE_SIZE = 50;

function parseIntOrKeep(val) {
    var result = parseInt(val);
    if (isNaN(result)) {
        return val;
    }
    return result;
}

function isNullOrUndefined(val) {
    return isNull(val) || isUndefined(val);
}

const stripEmpties = partialRight(
    pickBy,
    flow(
        identity,
        negate(isNullOrUndefined)
    )
);

const getTableOptions = params => () => {
    var overrides = stripEmpties({
        searching: params.showFilter,
        columnFilter: params.columnFilter
    });

    var gridOptions = {
        tableId: params.tableId,
        addRemoveRow: params.addRemoveRow,
        selectionAndNavigation: params.selectionNavigation,
        overrides: overrides,
        columnFilter: params.columnFilter,
        onError: bindKey(self, '_wrapAlert'),
        alwaysShowSelection: params.alwaysShowSelection,
        gridHeight: params.gridHeight,
        gridData: params.gridData,
        paginationSize: params.pageSize || DEFAULT_GRID_PAGE_SIZE,
        saveState: get(params, 'saveState', true),
        pageMode: params.pageMode,
        freezeColumns: params.freezeColumns
    };

    var pageMode = params['pageMode'];

    if (pageMode === 'paged') {
        gridOptions.pagination = 'local';
        gridOptions.paginationElement = $('.hidden-footer-toolbar').get(0); // hide the built-in paginator
    } else if (!pageMode || pageMode === 'none') {
    }

    if (isFunction(params.rowFilter)) {
        gridOptions.rowFilter = params.rowFilter;
    }

    gridOptions = stripEmpties(gridOptions);

    if (!isUndefined(params.modifier)) {
        if (isFunction(params.modifier)) {
            // Pass cloned options so they cannot modify the original table options object
            var modifiedTableOptions = params.modifier(cloneDeep(gridOptions));
            if (isPlainObject(modifiedTableOptions)) {
                gridOptions = modifiedTableOptions;
            }
        } else {
            // console.error('vdl-table (' + self.tableId + '): "modifier" attribute must be a function.');
        }
    }

    return gridOptions;
};

/**
 * VDL Extensions callback.
 *
 * It is this functions responsibility to create the ViewModel that supplies data and behaviour to the <vdlx-datagrid> UI template.
 *
 * @param {object} params - an object where each property is a static or dynamic runtime value for this VDL extension.
 * @param {object} componentInfo - An object containing info describing the component.
 * @param {HTMLElement} componentInfo.element the DOM node for this instance of the VDL extension.
 */
export default function createViewModel(params, componentInfo) {
    // Create the ViewModel object
    var vm = {};

    // Strip off the 'px' units if present.
    if (params.width) {
        vm.tableWidth = params.width.replace('px', '');
    }

    const element = componentInfo.element;
    const defaultScenario = params.scenarioId || 0;

    const tableId = get(params, 'tableId', uniqueId('vdlx-datagrid-'));
    params.tableId = tableId;

    const $element = $(element);
    /*
    Create the DIV placeholder to attach Tabulator component to. 
     */
    const $tableDiv = $('<div/>');
    $tableDiv.attr('id', tableId);
    $tableDiv.addClass('vdlx-datagrid table-striped table-bordered table-condensed');
    $element.append($tableDiv);

    if (!!params.class) {
        $(element)
            .find('.vdlx-datagrid')
            .addClass(params.class);
    }

    /*
    Create to DIV to hide the built-in pagination
     */
    const $hiddenFooter = $('<div class="hidden-footer-toolbar" style="display: none"/>');
    $element.append($hiddenFooter);

    /*
    Create the Footer toolbar with FICO pagination control.
     */
    const $footerToolBar = $('<div class="footer-toolbar"/>');
    $element.append($footerToolBar);
    /**
     * Wrap the options for the
     */
    const tableOptions$ = withDeepEquals(ko.pureComputed(getTableOptions(params)));
    const columnConfig$ = withDeepEquals(ko.observable({}));

    var datagrid = new Datagrid(element, tableOptions$, columnConfig$);

    function buildTable() {
        /*
        Collect the column information from the child VDL extensions (vdlx-datagrid-column)
         */
        const columnConfigs = $element.find('vdlx-datagrid-column').map(function(idx, element) {
            return clone(element['autotableConfig']);
        });
        if (!columnConfigs.length) {
            columnConfig$({ columnOptions: [], indicesOptions: {}, scenarioList: [] });
            return;
        }

        var entities = [];
        var indices = {};

        forEach(columnConfigs, function(configItem) {
            var scenarioNum = parseIntOrKeep(configItem.scenario || defaultScenario);
            if (isNumber(scenarioNum)) {
                if (scenarioNum < 0) {
                    // reject('Scenario index must be a positive integer.');
                }
            }
            configItem.scenario = scenarioNum;
            if (!!configItem.entity) {
                configItem.name = configItem.entity;
                delete configItem.entity;
                entities.push(omitBy(configItem, isNullOrUndefined));
            } else if (!!configItem.set) {
                if (!has(indices, [configItem.set])) {
                    indices[configItem.set] = [];
                }
                const indexList = indices[configItem.set];
                const cleanItem = omitBy(configItem, isNullOrUndefined);
                const setPosn = configItem.setPosition;
                if (setPosn == null) {
                    indexList.push(cleanItem);
                } else if (indexList[setPosn]) {
                    // reject('Table column for set "' + configItem.set + '" at position ' + setPosn
                    //     + ' specified more than once');
                } else {
                    indexList[setPosn] = cleanItem;
                    // if we have increased the length, then need to
                    // explicitly inserts null/undefined here, or some
                    // standard algorithms behave oddly. (E.g. _.map
                    // will count the missing items, but [].map won't)
                    range(indexList.length).forEach(function(j) {
                        if (!indexList[j]) {
                            indexList[j] = null;
                        }
                    });
                }
            } else {
                // reject('Unknown column type');
            }
        });

        var scenarioList = _(entities)
            .filter(function(item) {
                return !isNullOrUndefined(item);
            })
            .map(function(item) {
                return ko.unwrap(item.scenario);
            })
            .uniq()
            .sortBy()
            .value();

        if (isEmpty(scenarioList) || isEmpty(entities)) {
            console.debug(
                'vdl-table (' +
                    params.tableId +
                    '): Scenario list or table column configuration is empty, ignoring update'
            );
        }

        columnConfig$({ columnOptions: entities, indicesOptions: indices, scenarioList: scenarioList });
    }

    vm.tableUpdate = () => {
        defer(() => buildTable());
    };

    vm.tableValidate = function() {
        datagrid.validate();
    };

    vm.dispose = function() {
        datagrid.dispose();
    };

    buildTable();

    return vm;
}
