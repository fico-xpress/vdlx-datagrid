/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/export-csv.js
   ```````````````````````

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

import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';

const DEFAULT_FILENAME = 'data';

/**
 * Adds an export button to datagrid.
 *
 * @param {Tabulator} table The datagrid
 * @param {Element} container The table header element
 * @param {{enabled: boolean, filename: string}} props Export props
 */
export default (table, container, {enabled = false, filename = DEFAULT_FILENAME}) => {
    filename = trim(filename);
    if (isEmpty(filename)) {
        filename = DEFAULT_FILENAME;
    }

    const exportCsvControl = document.createElement('div');
    exportCsvControl.classList.add('export-csv-control');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('pull-right');

    const exportButton = document.createElement('button');
    exportButton.appendChild(document.createTextNode('EXPORT'));
    exportButton.setAttribute('title', 'Export to CSV file');
    exportButton.classList.add('btn', 'btn-sm');
    exportButton.addEventListener('click', () => exportData());

    if (!enabled) {
        exportButton.setAttribute('disabled', 'disabled');
    }

    exportCsvControl.appendChild(buttonContainer);
    buttonContainer.appendChild(exportButton);
    container.appendChild(exportCsvControl);

    const exportData = () => table.download('csv', `${filename}.csv`);

    return {
        /**
         * Remove the export csv control.
         */
        dispose: () => {
            container.removeChild(exportCsvControl);
        }
    };
};
