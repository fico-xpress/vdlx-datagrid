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
            debugger;
            const selectOptions = _.map(setValues, setValue => `<option value="${setValue.value}">${setValue.key}</option>`).join('');

            return `
            <div class="form-group">
              <label class="col-sm-4 control-label" for="${id}">
                ${indicesColumn.title}
              </label>
              <div class="col-sm-5">
                <select class="form-control" name="${indicesColumn.title}" id="${id}">
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

        const message = $(`
        <div>
            ${form}
        </div>
        `);

        bootbox.dialog({
            animate: false,
            title: 'Add Row',
            onEscape: true,
            closeButton: true,
            message: message,
            buttons: {
                confirm: {
                    label: 'OK',
                    className: 'btn btn-primary btn-add',
                    callback: () => {}
                },
                cancel: {
                    label: 'CANCEL',
                    className: 'btn',
                }
            },
            callback: (result) => {

            }
        });
    }

    removeRow() {
    }

    updateSetValues (indicesColumns, allSetValues) {
        this.indicesColumns = indicesColumns;
        this.allSetValues = allSetValues;
    }
};