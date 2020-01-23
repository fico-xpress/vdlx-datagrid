/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/add-remove.js
   ```````````````````````
   vdlx-datagrid add remove rows.

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

/**
 * adds an export button
 * @param table
 * @param container
 * @param filename
 * @returns {{enable: enable, dispose: dispose}}
 */
export default (table, container, filename = 'data') => {
    const exportCsvControl = document.createElement('div');
    exportCsvControl.classList.add('export-csv-control');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('pull-right');

    const exportButton = document.createElement('button');
    exportButton.appendChild(document.createTextNode('EXPORT'));
    exportButton.setAttribute('title', 'Export to CSV file');
    exportButton.classList.add('btn', 'btn-sm');

    exportButton.addEventListener('click', () => exportData());

    exportCsvControl.appendChild(buttonContainer);
    buttonContainer.appendChild(exportButton);
    container.appendChild(exportCsvControl);

    const exportData = () => {
        table.download('csv', filename + '.csv');
    };

    return {
        /**
         * remove the control
         */
        dispose: () => {
            container.removeChild(exportCsvControl);
        },
        /**
         * enable/disable the button
         * @param enable
         */
        enable: (enable) => {
            if (enable) {
                exportButton.removeAttribute('disabled');
            } else {
                exportButton.setAttribute('disabled', true);
            }
        }
    };
};
