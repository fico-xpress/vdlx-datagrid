/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/view-model.js
   ```````````````````````
   vdlx-datagrid VDL extension view model

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
import { withDeepEquals, createMutationObservable, withDeferred } from '../ko-utils';

import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import map from 'lodash/map';
import size from 'lodash/size';
import omit from 'lodash/omit';
import createColumnConfig from './create-column-config';
import mapValues from 'lodash/mapValues';
import createTableOptions from './create-table-options';
import filter from 'lodash/filter';
import toLower from 'lodash/toLower';

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
        $(element).find('.vdlx-datagrid').addClass(params.class);
    }

    // Create the header bar for the export button
    const $headerToolBar = $('<div class="header-toolbar"/>');
    $element.prepend($headerToolBar);

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

    const columnConfigurations$ = withDeepEquals(ko.observable({}));

    const globalIndexFilters$ = withDeepEquals(ko.observable({}));

    const mutation$ = createMutationObservable(element, { childList: true });

    const columnElements$ = ko.pureComputed(() => {
        mutation$();
        return element.getElementsByTagName('vdlx-datagrid-column');
    });

    const indexFilterElementsCount$ = ko.pureComputed(() => {
        mutation$();
        return filter(element.children, (child) => toLower(child.tagName) === 'vdlx-datagrid-index-filter').length;
    });

    const filters$ = ko.pureComputed(() => {
        if (indexFilterElementsCount$() !== size(globalIndexFilters$())) {
            return filters$.peek();
        }
        return globalIndexFilters$();
    });

    const columnConfigurationsArray$ = ko.pureComputed(() => {
        if (columnElements$().length !== size(columnConfigurations$())) {
            return columnConfigurationsArray$.peek();
        }

        return map(columnElements$(), (columnElement, idx) => ({
            ...columnConfigurations$()[columnElement.columnId],
            index: idx,
        }));
    });

    const params$ = withDeepEquals(ko.pureComputed(() => mapValues(params, ko.unwrap)));
    const tableOptions$ = withDeepEquals(ko.pureComputed(() => createTableOptions(params$())));
    const columnConfig$ = withDeepEquals(
        ko.pureComputed(() => {
            const columnConfigs = columnConfigurationsArray$();
            if (!columnConfigs) {
                return columnConfig$.peek();
            }

            return createColumnConfig(columnConfigs, defaultScenario, params.tableId);
        })
    );

    const datagrid = new Datagrid(element, tableOptions$, columnConfig$, filters$);

    vm.addColumn = (columnId, props) => {
        return columnConfigurations$({ ...columnConfigurations$.peek(), [columnId]: props });
    };

    vm.removeColumn = (columnId) => {
        return columnConfigurations$(omit(columnConfigurations$.peek(), columnId));
    };

    vm.tableValidate = function () {
        datagrid.validate();
    };

    vm.dispose = function () {
        datagrid.dispose();
    };

    vm.filterUpdate = function (filterId, filterProperties) {
        globalIndexFilters$({
            ...globalIndexFilters$.peek(),
            [filterId]: filterProperties,
        });
    };

    vm.filterRemove = function (filterId) {
        return globalIndexFilters$(omit(globalIndexFilters$.peek(), filterId));
    };

    return vm;
}
