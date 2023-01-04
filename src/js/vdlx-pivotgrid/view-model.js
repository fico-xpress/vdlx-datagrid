/*
   Xpress Insight vdlx-pivotgrid
   =============================

   file vdlx-pivotgrid/view-model.js
   ```````````````````````
   vdlx-pivotgrid VDL extension view model

    (c) Copyright 2023 Fair Isaac Corporation

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
import Datagrid from '../datagrid/datagrid';
import {withDeepEquals} from '../ko-utils';
import {$, ko} from '../insight-modules';

import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import createTableOptions from '../datagrid/create-table-options';
import noop from 'lodash/noop';

/**
 * VDL Extensions callback.
 *
 * It is this functions responsibility to create the ViewModel that supplies data and behaviour to the <vdlx-pivotgrid> UI template.
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

    const tableId = get(params, 'tableId', uniqueId('vdlx-pivotgrid-'));
    params.tableId = tableId;

    const $element = $(element);
    /*
    Create the DIV placeholder to attach Tabulator component to. 
     */
    const $tableDiv = $('<div/>');
    $tableDiv.attr('id', tableId);
    $tableDiv.addClass('vdlx-pivotgrid table-striped table-bordered table-condensed');
    $element.append($tableDiv);

    if (!!params.class) {
        $(element).find('.vdlx-pivotgrid').addClass(params.class);
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

    const params$ = withDeepEquals(ko.pureComputed(() => mapValues(params, ko.unwrap)));
    const tableOptions$ = withDeepEquals(ko.pureComputed(() => createTableOptions(params$())));

    const datagrid = new Datagrid(element, tableOptions$, undefined, undefined);

    vm.addColumn = noop();

    vm.removeColumn = noop();

    vm.tableValidate = function () {
        datagrid.validate();
    };

    vm.dispose = function () {
        datagrid.dispose();
    };

    vm.filterUpdate = noop();

    vm.filterRemove = noop();

    return vm;
}
