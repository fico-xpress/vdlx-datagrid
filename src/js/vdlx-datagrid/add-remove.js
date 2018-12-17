const dialogs = insightModules.load('dialogs');

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

export default class AddRemove {
    /**
     * 
     * @param {*} table 
     * @param {boolean} autoinc 
     */
    constructor(table, autoinc) {
        this.$addRemoveControl = $(ADD_REMOVE_TEMPLATE);
        this.indicesColumns = [];
        this.entitiesColumns = [];
        this.allSetValues = [];
        this.data = [];
        this.selectedRow = undefined;
        this.table = table;
        this.autoinc = autoinc;
        this.defaultScenario = undefined;
    }

    /**
     *
     * @param {Element} container
     * @memberof AddRemove
     */
    appendTo(container) {
        this.$addRemoveControl.appendTo(container);
        this.$addRemoveControl.on('click', '.btn-table-add-row', (evt) => {
            if (this.autoinc) {
                this.autoAddRow();
            } else {
                this.openAddRowDialog();
            }
        });
        this.$addRemoveControl.on('click', '.btn-table-remove-row', (evt) => this.removeRow());
    }

    /**
     *
     * @param {boolean} enabled
     * @memberof AddRemove
     */
    setEnabled(enabled) {
        enabled ? this.$addRemoveControl.show() : this.$addRemoveControl.hide();
    }

    addNewRowToTable (newRow) {
        return this.table.addRow(newRow)
            .then(row => {
                this.table.setSort(this.table.getSorters());
                this.data = this.table.getData();
                return this.table.scrollToRow(row)
                    .then(_.constant(row));
            })
            .then(row => {
                const $row = $(row.getElement());
                $row.addClass('highlight').css('opacity', 0.2);
                $row.animate({ opacity: 1.0 });
                $row.animate({ opacity: 0.2 });
                $row.animate({ opacity: 1.0 }, 2000, 'swing', function () {
                    $row.removeClass('highlight');
                });
            });
    } 

    openAddRowDialog() {
        const formFields = _.map(_.zip(this.indicesColumns, this.allSetValues), ([indicesColumn, setValues]) => {
            const id = _.uniqueId('add-remove-row-');
            const selectOptions = _.map(setValues, setValue => `<option value="${setValue.value}">${setValue.key}</option>`).join('');

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
        const validateForm = (formData) => {
            const emptyValue = _.some(formData, _.negate(_.identity));

            if (emptyValue) {
                return 'Please set all indices to create a new row';
            }

            const alreadyExists = _.find(
                this.data,
                formData
            );

            if (alreadyExists) {
                return 'A row with these indices already exists';
            }
            return undefined;
        };

        const submit = evt => {
            const formData = _.reduce(
                $message.find('form').serializeArray(),
                (acc, value) => _.assign(acc, _.set({}, value.name, value.value)),
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
            buttons: {
                ok: {
                    label: 'OK',
                    className: 'btn btn-primary btn-add',
                    callback: evt => {
                        const newRow = submit(evt)
                        if (!newRow) {
                            return false;
                        }

                        return this.addNewRowToTable(newRow);
                    }
                },
                cancel: {
                    label: 'CANCEL',
                    className: 'btn',
                }
            }
        });
    }

    autoAddRow () {
        const nextValue = _.isEmpty(this.allSetValues[0]) ? 1 : _.max(_.map(this.allSetValues[0], 'key')) + 1;
        const { name, field } = this.indicesColumns[0];

        const commitPromise = this.defaultScenario
            .modify()
            .addToSet(name, nextValue)
            .commit();

        this.$addRemoveControl.find('button.btn-table-add-row').attr('disabled', '');
        return Promise.all([commitPromise, this.addNewRowToTable(_.set({}, field, nextValue))])
            .then(() => {
                this.allSetValues[0] = this.allSetValues[0].concat({ key: nextValue, value: nextValue });
            })
            .catch(() =>
                dialogs.alert('Could not add row. There was an issue updating the server.', 'Row add failed')
            )
            .then(() => 
                this.$addRemoveControl.find('button.btn-table-add-row').removeAttr('disabled')
            );
    }

    removeRow () {
        const data = this.selectedRow.getData();

        const modifiers = _.mapValues(
            _.reduce(this.entitiesColumns, (acc, column) => _.set(acc, column.scenario.getId(), column.scenario), {}),
            scenario => scenario.modify()
        );

        _.each(this.entitiesColumns, (column) => {
            const rowKey = column.getRowKey(data);
            modifiers[column.scenario.getId()].removeFromArray(column.name, rowKey);
        });

        const promises = _.map(modifiers, modifier => modifier.commit());

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

    update (indicesColumns, entitiesColumns, defaultScenario, allSetValues, data) {
        this.indicesColumns = indicesColumns;
        this.entitiesColumns = entitiesColumns;
        this.allSetValues = allSetValues;
        this.data = data;
        this.defaultScenario = defaultScenario;
    }

    setSelectedRow (row) {
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
};