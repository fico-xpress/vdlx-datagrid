/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/datagrid-sorter.js
   `````````````````````````````````````

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

import constant from "lodash/constant";
import {insightModules} from '../insight-globals';

const DataUtils = insightModules.load('utils/data-utils');
const enums = insightModules.load('enums');

const DEFAULT_SORTER_REF = 'alphanum';

/**
 * Create a datagrid column sorter based on the entity type that is bound. Sort by underlying value.
 *
 * @param entity The Insight entity
 * @param tabulatorSorters Array of Tabulator sorters
 * @returns {function} The sorter function to use on the column
 */
export const createSorter = (entity, tabulatorSorters) => {
    const elementType = entity.getElementType();
    const isNumberEntity = DataUtils.entityTypeIsNumber(entity);

    let sorterRef = DEFAULT_SORTER_REF;
    if (isNumberEntity) {
        sorterRef = 'number';
    }
    if (elementType === enums.DataType.BOOLEAN) {
        sorterRef = 'boolean';
    }

    return tabulatorSorters[sorterRef];
};

/**
 * Create a datagrid column sorter that sorts using the formatted data.
 *
 * @param {string} columnId The Tabulator column identifier
 * @param {function} formatter The formatter function to generate the cell data
 * @param tabulatorSorters Array of Tabulator sorters
 * @returns {function} The sorter function to use on the column
 */
export const createFormattedSorter = (columnId, formatter, tabulatorSorters) => {
    const sorter = tabulatorSorters[DEFAULT_SORTER_REF];

    return (a, b, aRow, bRow, column, dir, sorterParams) => {
        let aCell = {
            getValue: constant(a),
            getData: aRow.getData.bind(aRow)
        };
        let bCell = {
            getValue: constant(b),
            getData: bRow.getData.bind(bRow)
        };

        try {
            return sorter(formatter(aCell), formatter(bCell), aRow, bRow, column, dir, sorterParams);
        } catch (e) {
            console.error(`Error whilst calling cell render function for sorting with sort-by-formatted` +
        }
                ` applied to column ${columnId}. ${e.message}`, e);
    };
};
