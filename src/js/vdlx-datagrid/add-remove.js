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
                class="btn btn-link btn-table-action btn-table-remove-row"
                title="Delete Selected Row"
                tabindex="-1"
            />
        </div>
    </div>
</div>
`;


export default class AddRemove {
    constructor() {
        this.$addRemoveControl = $(ADD_REMOVE_TEMPLATE);
        this.indicesColumns = [];
        this.allSetValues = [];
        this.data = [];
    }

    /**
     *
     * @param {Element} container
     * @memberof AddRemove
     */
    appendTo(container) {
        this.$addRemoveControl.appendTo(container);
        this.$addRemoveControl.on('click', '.btn-table-add-row', (evt) => this.openAddRowDialog());
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
         * @param {JQuery<HTMLElement>} $form 
         * @returns {string?}
         */
        const validateForm = ($form) => {
            const formData = $form.serializeArray();

            const emptyValue = _.find(formData, {value: ''});

            if (emptyValue) {
                return 'Please set all indices to create a new row';
            }

            const alreadyExists = _.find(
                this.data,
                _.reduce(formData, (acc, value) => _.assign(acc, _.set({}, value.name, value.value)), {})
            );

            if (alreadyExists) {
                return 'A row with these indices already exists';
            }
            return undefined;
        };

        const submit = evt => {
            const err = validateForm($message.find('form'));

            if (err) {
                $message.find('.alerts').html(`<div class="alert alert-danger">${err}</div>`);
                return false;
            }
        };

        bootbox.dialog({
            animate: false,
            title: 'Add Row',
            onEscape: true,
            closeButton: true,
            message: $message,
            buttons: {
                confirm: {
                    label: 'OK',
                    className: 'btn btn-primary btn-add',
                    callback: (evt) => {
                        return submit(evt);
                    }
                },
                cancel: {
                    label: 'CANCEL',
                    className: 'btn',
                }
            },
            callback: (result) => {
                debugger;
            }
        });
    }

    removeRow() {
    }

    update (indicesColumns, allSetValues, data) {
        this.indicesColumns = indicesColumns;
        this.allSetValues = allSetValues;
        this.data = data;
    }
};