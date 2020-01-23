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

import isFunction from 'lodash/isFunction';

/**
 * adds a button that exports table data to a file
 */
export default class ExportCsv {

    /**
     * @param {*} table
     * @param {*} container
     * @param {*} options
     */
    constructor(table, container, options) {
        this.table = table;
        this.container = container;
        this.exportFilename = options.exportFilename;
        const that = this;

        let showExport = options.showExport;
        if (!isFunction(showExport) && !!showExport) {
            that.create(table, container);
            return;
        }

        showExport.subscribe(show => {
            if (show) {
                that.create();
            } else {
                that.destroy();
            }
        });

    }

    create() {

        const exportCsvControl = document.createElement('div');
        exportCsvControl.classList.add('export-csv-control');

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('pull-right');

        const exportButton = document.createElement('button');
        exportButton.appendChild(document.createTextNode('EXPORT'));
        exportButton.setAttribute('title', 'Export to CSV file');
        exportButton.classList.add('btn', 'btn-sm');

        const that = this;
        exportButton.addEventListener('click', () => that.exportData());

        exportCsvControl.appendChild(buttonContainer);
        buttonContainer.appendChild(exportButton);
        this.container.appendChild(exportCsvControl);

    }

    destroy () {
        const headerToolbar = this.container.querySelector('.export-csv-control');
        if (headerToolbar) {
            this.container.removeChild(headerToolbar);
        }
    }

    exportData() {
        let fileName = isFunction(this.exportFilename) ? this.exportFilename() : this.exportFilename;
        this.table.download('csv', fileName !== undefined ? fileName + '.csv': 'data' + '.csv');
    }

}
