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
        const message = $(`
        <div>
            <select>
                <option>1</option>
                <option>2</option>
            </select>
        </div>`);

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
                    callback: () => {}
                }
            },
            callback: (result) => {

            }
        });

    }

    removeRow() {

    }

    updateAddRemoveComponent() {

    } 
};