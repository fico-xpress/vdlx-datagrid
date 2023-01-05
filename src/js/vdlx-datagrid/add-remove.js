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
import each from 'lodash/each';
import mapValues from 'lodash/mapValues';
import max from 'lodash/max';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import assign from 'lodash/assign';
import every from 'lodash/every';
import find from 'lodash/find';
import identity from 'lodash/identity';
import negate from 'lodash/negate';
import some from 'lodash/some';
import uniqueId from 'lodash/uniqueId';
import zip from 'lodash/zip';
import constant from 'lodash/constant';
import map from 'lodash/map';
import {dialogs} from '../insight-modules';

const ADD_REMOVE_TEMPLATE = `
<div class="add-remove-control">
    <div class="pull-left">
        <div class="add-remove-fico">
            <button
                type="button"
                class="btn btn-link btn-table-action btn-table-add-row "
                title="Add New Row"
                tabindex="-1"
            />
            <button
                type="button"
                class="btn btn-link btn-table-action btn-table-remove-row disabled"
                title="Delete Selected Row"
                disabled
                tabindex="-1"
            />
        </div>
    </div>
</div>
`;

const DIALOG_CLASS = 'vdlx-datagrid-add-row';

export default class AddRemove {
    /**
     * @param {*} table The Tabulator object
     * @param {function} rowIndexGenerator Generates a unique row index value for the table
     * @param {boolean} autoinc Whether to use row indices auto increment mode
     */
    constructor(table, rowIndexGenerator, autoinc) {
        this.$addRemoveControl = $(ADD_REMOVE_TEMPLATE);
        this.indicesColumns = [];
        this.entitiesColumns = [];
        this.allSetValues = [];
        this.data = [];
        this.selectedRow = undefined;
        this.table = table;
        this.rowIndexGenerator = rowIndexGenerator;
        this.autoinc = autoinc;
        this.defaultScenario = undefined;
        this.enabled = false;
    }

    /**
     *
     * @param {Element} container
     * @memberof AddRemove
     */
    appendTo(container) {
        this.$addRemoveControl.appendTo(container);
        this.$addRemoveControl.on('click', '.btn-table-add-row', evt => {
            if (this.autoinc) {
                this.autoAddRow();
            } else {
                this.openAddRowDialog();
            }
        });
        this.$addRemoveControl.on('click', '.btn-table-remove-row', evt => this.removeRow());
    }

    /**
     *
     * @param {boolean} enabled
     * @memberof AddRemove
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        let buttons = this.$addRemoveControl[0].querySelectorAll('button');
        for (let button of buttons) {
            button.disabled = !enabled;
        }
    }

    dismiss() {
        let elements = document.getElementsByClassName(DIALOG_CLASS);
        for (let element of elements) {
            $(element).modal('hide');
        }
    }

    addNewRowToTable(newRow) {
        newRow = {id: this.rowIndexGenerator(), ...newRow};
        return this.table
            .addRow(newRow)
            .then(row => {
                this.table.setSort(
                    map(this.table.getSorters(), sorter => ({
                        dir: sorter.dir,
                        column: sorter.field
                    }))
                );

                this.data = this.table.getData();

                if (!this.table.options.pagination) {
                    return this.table.scrollToRow(row).then(constant(row));
                }

                const position = row.getPosition(true);
                const pageSize = this.table.getPageSize();
                const page = Math.floor(position / pageSize) + 1;

                this.table.setPage(page);

                return row;
            })
            .then(row => {
                const $row = $(row.getElement());
                $row.addClass('highlight').css('opacity', 0.2);
                $row.animate({opacity: 1.0});
                $row.animate({opacity: 0.2});
                $row.animate({opacity: 1.0}, 2000, 'swing', function () {
                    $row.removeClass('highlight');
                });
            });
    }

    openAddRowDialog() {
        const formFields = map(zip(this.indicesColumns, this.allSetValues), ([indicesColumn, setValues]) => {
            const id = uniqueId('add-remove-row-');
            const selectOptions = map(
                setValues,
                setValue => `<option value="${setValue.key}">${setValue.value}</option>`
            ).join('');

            return `
            <div class="form-group">
              <label class="col-sm-4 control-label" for="${id}">
                ${indicesColumn.title}
              </label>
              <div class="col-sm-5">
                <select class="form-control" name="${indicesColumn.field}" id="${id}">
                  <option value="">Choose value</option>
                  ${selectOptions}
                </select>
              </div>
            </div>
            `;
        }).join('');

        const form = `
        <form class="form-horizontal modal-form " id="autotable-3-addForm" title="">
            ${formFields}
        </form>
        `;

        const $message = $(`
        <div>
            ${form}
            <div class="alerts"></div>
        </div>
        `);

        /**
         * @param {Object} formData
         * @returns {string?}
         */
        const validateForm = formData => {
            const emptyValue = some(formData, negate(identity));

            if (emptyValue) {
                return 'Please set all indices to create a new row';
            }

            const alreadyExists = find(this.data, row =>
                every(formData, (value, columnName) => String(row[columnName]) === String(value))
            );

            if (alreadyExists) {
                return 'A row with these indices already exists';
            }
            return undefined;
        };

        const submit = evt => {
            const formData = reduce(
                $message.find('form').serializeArray(),
                (acc, value) => assign(acc, set({}, value.name, value.value)),
                {}
            );
            const err = validateForm(formData);

            if (err) {
                $message.find('.alerts').html(`<div class="alert alert-danger">${err}</div>`);
                return false;
            }
            return formData;
        };

        bootbox.dialog({
            animate: false,
            title: 'Add Row',
            onEscape: true,
            closeButton: true,
            message: $message,
            className: DIALOG_CLASS,
            buttons: {
                ok: {
                    label: 'OK',
                    className: 'btn btn-primary btn-add',
                    callback: evt => {
                        const newRow = submit(evt);
                        if (!newRow) {
                            return false;
                        }

                        return this.addNewRowToTable(newRow);
                    }
                },
                cancel: {
                    label: 'CANCEL',
                    className: 'btn'
                }
            }
        });
    }

    autoAddRow() {
        const nextValue = isEmpty(this.allSetValues[0]) ? 1 : max(map(this.allSetValues[0], 'key')) + 1;
        const {name, field} = this.indicesColumns[0];

        const commitPromise = this.defaultScenario
            .modify()
            .addToSet(name, nextValue)
            .commit();

        this.$addRemoveControl.find('button.btn-table-add-row').attr('disabled', '');
        return commitPromise
            .then(() => this.addNewRowToTable(set({}, field, nextValue)))
            .then(() => {
                this.allSetValues[0] = isEmpty(this.allSetValues[0])
                    ? [{key: nextValue, value: nextValue}]
                    : this.allSetValues[0].concat({key: nextValue, value: nextValue})
            })
            .catch(() => dialogs.alert('Could not add row. There was an issue updating the server.', 'Row add failed'))
            .then(() => this.$addRemoveControl.find('button.btn-table-add-row').removeAttr('disabled'));
    }

    removeRow() {
        const data = this.selectedRow.getData();

        const modifiers = mapValues(
            reduce(this.entitiesColumns, (acc, column) => set(acc, column.scenario.getId(), column.scenario), {}),
            scenario => scenario.modify()
        );

        each(this.entitiesColumns, column => {
            const rowKey = column.getRowKey(data);
            modifiers[column.scenario.getId()].removeFromArray(column.name, rowKey);
        });

        const promises = map(modifiers, modifier => modifier.commit());

        return Promise.all([promises].concat(this.selectedRow.delete()))
            .then(() => {
                this.table.redraw(true);
                this.data = this.table.getData();
                this.setSelectedRow(undefined);
            })
            .catch(() => {
                this.table.addRow(this.selectedRow.getData());
                this.table.setSort(this.table.getSorters());
                dialogs.alert('Could not delete row. There was an issue updating the server.', 'Row deletion failed');
                throw Error('Row deletion failed');
            });
    }

    update(indicesColumns, entitiesColumns, defaultScenario, allSetValues, data) {
        this.indicesColumns = indicesColumns;
        this.entitiesColumns = entitiesColumns;
        this.allSetValues = allSetValues;
        this.data = data;
        this.defaultScenario = defaultScenario;
    }

    setSelectedRow(row) {
        if (!this.enabled) {
            return;
        }

        this.selectedRow = row;
        if (this.selectedRow) {
            this.$addRemoveControl
                .find('.btn-table-remove-row')
                .removeAttr('disabled')
                .removeClass('disabled');
        } else {
            this.$addRemoveControl
                .find('.btn-table-remove-row')
                .attr('disabled', '')
                .addClass('disabled');
        }
    }
}
