/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-validate/view-model.js
   ```````````````````````
   vdlx-datagrid-validate view model.

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
const validatorRegistry = insightModules.load('vdl-validator-registry');
import { $ } from '../globals';
import { isFunction } from 'lodash';

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

    isFunction(params.validate) && params.validate();

    return {
        dispose: function () {
            validatorRegistry.remove(registryId);
            isFunction(params.validate) && params.validate();
        }
    };
}
