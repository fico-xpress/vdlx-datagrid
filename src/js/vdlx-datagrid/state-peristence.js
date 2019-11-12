import { startsWith } from 'lodash';

/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/state-persistence.js
   ```````````````````````
   vdlx-datagrid state persistence.

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

const VDL_QUERY_PARAM = 'vdl=';
const KEY_PREFIX = 'TableState';
const KEY_SEPARATOR = '__';
/**
 * Generate the URL part for the storage key. Strips out all but the vdl query parameter.
 *
 * @returns {string}
 */
function generateUrlKey() {
    let key = window.location.pathname + window.location.hash;

    if (window.location.search) {
        const matchedVdl = window.location.search
            .substr(1)
            .split('&')
            .filter(function(part) {
                // Find the vdl query parameter
                return startsWith(part, VDL_QUERY_PARAM);
            });

        if (matchedVdl.length) {
            key += '?' + matchedVdl[0];
        }
    }
    return key;
}

/** @typedef {{sorters: Array, filters: Array}} State*/

/**
 * @param {string} tableId
 * @param {string} keySuffix
 */
export const createStateManager = (tableId, keySuffix) => {
    const key = [KEY_PREFIX, generateUrlKey(), tableId, keySuffix].join(KEY_SEPARATOR);
    return {
        /** @param {State} data */
        saveState: data => {
            try {
                window.sessionStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.error('Could not save table state for tableId: ' + tableId, e);
            }
        },

        /** @returns {State} */
        loadState: () => {
            try {
                return JSON.parse(window.sessionStorage.getItem(key));
            } catch (e) {
                console.error('Could not load table state for tableId: ' + tableId, e);
                return {
                    filters: [],
                    sorters: []
                };
            }
        }
    };
};
