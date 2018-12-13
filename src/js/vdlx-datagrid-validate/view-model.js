const validatorRegistry = insightModules.load('vdl-validator-registry');

export default function (params, componentInfo) {
    var fieldElement = $(componentInfo.element).parents('vdlx-datagrid-column')[0];
    if (!fieldElement) {
        throw Error('Cannot find parent <vdlx-datagrid-column> for <vdl-validate>');
    }

    var callback = params['pass'];
    if (!callback) {
        throw Error('Missing a "pass" attribute for <vdl-validate>');
    }

    var registryId = validatorRegistry.add({
        element: fieldElement,
        validate: function (entityName, value, indices, rowData) {
            if (callback(entityName, value, indices, rowData)) {
                return {
                    isValid: true
                };
            } else {
                return {
                    isValid: false,
                    errorMessage: params['message'],
                    allowSave: ko.unwrap(params['allowSave']) || false
                };
            }
        }
    });

    _.isFunction(params.validate) && params.validate();

    return {
        dispose: function () {
            validatorRegistry.remove(registryId);
            _.isFunction(params.validate) && params.validate();
        }
    };
}
