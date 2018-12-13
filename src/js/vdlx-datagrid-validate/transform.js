const DEFAULT_VALIDATION_ERROR_MESSAGE = 'The value is not valid';

export default function (element, attributes, api) {
    var $element = $(element);

    if (!$element.parents('vdlx-datagrid-column').length) {
        throw Error('<vdl-validate> must be contained within a <vdlx-datagrid-column> tag');
    }

    var pass = attributes['pass'];
    if (!pass || pass.expression.isString) {
        throw Error('The "pass" attribute must be supplied as an expression');
    }

    var paramsBuilder = api.getComponentParamsBuilder(element);

    var message = $element.text().trim();
    if (!message) {
        message = DEFAULT_VALIDATION_ERROR_MESSAGE;
    }

    var allowSave = attributes['allow-save'];
    if (allowSave) {
        if (allowSave.expression.isString) {
            paramsBuilder.addParam('allowSave', allowSave.rawValue === 'true');
        } else {
            paramsBuilder.addParam('allowSave', allowSave.expression.value, true);
        }
    }

    paramsBuilder
        .addFunctionOrExpressionParam('pass', pass.expression.value, ['entityName', 'value', 'indices', 'rowData'])
        .addParam('message', message)
        .addParam('validate', '$component.validate', true);
}