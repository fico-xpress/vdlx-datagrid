/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-index-filter/view-model.js
   ```````````````````````
   vdlx-datagrid-index-filter view model.

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

const {_, $} = window;

/**
 * @typedef {Object} indexFilterVMParams
 * @property {function(string, Object)} filterUpdate
 * @property {function(string)} filterRemove
 * @property {string} setName
 * @property {string} setPosition
 * @property {string} value
 */

/**
 * @param {indexFilterVMParams} params
 */
export default function (params) {
    var guid = _.uniqueId('vdl-index-filter-');
    var filterUpdate = _.partial(params.filterUpdate, guid);
    var filterRemove = _.partial(params.filterRemove, guid);

    var filters$ = ko
        .pureComputed(function () {
            return {
                setName: params.setName,
                setPosition: params.setPosition,
                value: ko.unwrap(params.value).toString()
            };
        });

    var filters$Subscription = filters$.subscribe(filterUpdate);
    filterUpdate(filters$());

    return {
        dispose: function () {
            filters$Subscription.dispose();
            filterRemove();
        }
    };
};