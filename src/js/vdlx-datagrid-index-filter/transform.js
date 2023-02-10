/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-index-filter/transform.js
   ```````````````````````
   vdlx-datagrid-index-filter transform function.

    (c) Copyright 2023 Fair Isaac Corporation

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
import has from 'lodash/has';
import find from 'lodash/find';
import get from 'lodash/get';
import { dataUtils } from '../insight-modules';

export default (element, attributes, api) => {
    var $element = $(element);
    var column = $element.closest('vdlx-datagrid-column').get(0);
    var table = $element.closest('vdlx-datagrid').get(0);
    const paramsBuilder = api.getComponentParamsBuilder(element);
    const setName = attributes['set'].rawValue;

    const setEntity = api.getModelEntityByName(setName);
    if (!setEntity) {
        throw Error('Entity "' + setName + '" not found in the model. Cannot set index filter.');
    }

    let setPosition = get(attributes, ['set-position', 'rawValue'], 0);
    if (!/^\d+$/.test(setPosition)) {
        throw Error('Invalid set-position: ' + setPosition);
    } else {
        setPosition = +setPosition;
    }

    if (column) {
        var entityName = $element.closest('[entity]').attr('entity');

        if (!entityName) {
            throw Error(
                '<vdlx-datagrid-index-filter> must be contained within a <vdlx-datagrid-column> that defines an "entity".'
            );
        }
        const parentArray = api.getModelEntityByName(entityName);
        if (!parentArray) {
            throw Error('Entity "' + entityName + '" does not exist in the model schema.');
        }
        const indexSetNames = parentArray.getIndexSets();
        if (!indexSetNames) {
            throw Error('Entity "' + entityName + '" must be an array.');
        }
        const indexSetNameAndPosns = dataUtils.getSetNamesAndPosns(indexSetNames);

        if (!find(indexSetNameAndPosns, { name: setName, position: setPosition })) {
            if (has(attributes, 'set-position')) {
                throw Error(
                    'Invalid index set name/position combination ("' +
                        setName +
                        '",' +
                        setPosition +
                        ') for array ' +
                        entityName
                );
            } else {
                throw Error('Invalid index set "' + setName + '" for array ' + entityName);
            }
        }
    } else if (table) {
    }

    paramsBuilder
        .addParam('setName', setName)
        .addParam('setPosition', setPosition)
        .addRawOrExpressionParam('value', attributes.value)
        .addParentCallbackParam('filterUpdate')
        .addParentCallbackParam('filterRemove');
};
