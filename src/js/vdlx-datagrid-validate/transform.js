/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-validate/transform.js
   ```````````````````````
   vdlx-datagrid-validate transform function.

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
const DEFAULT_VALIDATION_ERROR_MESSAGE = 'The value is not valid';

export default function(element, attributes, api) {
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
