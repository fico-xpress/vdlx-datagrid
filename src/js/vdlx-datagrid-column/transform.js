/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/transform.js
   ```````````````````````
   vdlx-datagrid-column extension.

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

const DataUtils = insightModules.load('utils/data-utils');
const enums = insightModules.load('enums');
import { _, $ } from '../globals';

/**
 * @param {HTMLElement} element
 * @param {{ [x: string]: any; }} attributes
 * @param {*} api
 */
export const transform = (element, attributes, api) => {
    var $element = $(element);
    if (!$element.closest('vdlx-datagrid').length) {
        throw Error('<vdlx-datagrid-column> must be contained within a <vdlx-datagrid> tag.');
    }
    if (!attributes.entity && !attributes.set) {
        throw Error('Must specify either an "entity" or "set" attribute for <vdlx-datagrid-column>.');
    }
    if (attributes.entity && attributes.set) {
        throw Error('You cannot specify both "entity" and "set" on a <vdlx-datagrid-column>.');
    }
    if (attributes['set-position'] && !attributes.set) {
        throw Error('You cannot specify "set-position" without also specifying "set"');
    }
    if (attributes.set && attributes.scenario) {
        throw Error(
            'The "scenario" attribute cannot be used in combination with the "set" attribute on a <vdlx-datagrid-column>.'
        );
    }
    var entityAttr = !!attributes.entity ? attributes.entity : attributes.set;
    var entityName = entityAttr.rawValue;
    var entity = api.getModelEntityByName(entityName);
    if (!entity) {
        throw Error('Entity "' + entityName + '" does not exist in the model schema.');
    }
    var setPosition = _.get(attributes, ['set-position', 'rawValue']);
    if (setPosition != null) {
        if (!/^\d+$/.test(setPosition)) {
            throw Error('Invalid set-position "' + setPosition + '", must be a number at least zero');
        } else {
            setPosition = +setPosition;
        }
    }
    var entityType = entity.getType();
    if (attributes.entity && entityType !== enums.DataType.ARRAY) {
        throw Error('Entity type ' + entityType + ' cannot be displayed as a column in <vdlx-datagrid>.');
    } else if (attributes.set && entityType !== enums.DataType.SET) {
        throw Error('Entity type ' + entityType + ' cannot be specified as an index set in <vdlx-datagrid>.');
    }
    var paramsBuilder = api
        .getComponentParamsBuilder(element)
        .addParam('tableUpdate', '$component.tableUpdate', true)
        .addParam('tableValidate', '$component.tableValidate', true)
        .addParam('validate', '$component.validate', true);
    if (!!attributes.entity) {
        paramsBuilder.addParam('entity', entityName);
    } else {
        paramsBuilder.addParam('set', entityName);
    }
    if (setPosition != null) {
        paramsBuilder.addParam('setPosition', setPosition);
    }
    var heading = attributes['heading'];
    if (heading) {
        paramsBuilder.addRawOrExpressionParam('heading', heading);
    } else {
        var textContent = $(element)
            .contents()
            .filter(function (index, element) {
                return element.nodeType === Node.TEXT_NODE && element.textContent.trim() !== '';
            })
            .toArray()
            .map(function (element) {
                return element.textContent.trim();
            })
            .join(' ');
        if (textContent) {
            paramsBuilder.addParam('heading', textContent);
        }
    }
    var scenario = attributes['scenario'];
    if (scenario) {
        paramsBuilder.addRawOrExpressionParam('scenario', scenario);
    }
    var editable = attributes['editable'];
    if (attributes['editable']) {
        if (entity.getManagementType() === enums.EntityManagementType.RESULT) {
            throw Error('Cannot set editable attribute on a <vdlx-datagrid-column> bound to a result entity.');
        }
        paramsBuilder.addRawOrExpressionParam('editable', editable);
    }
    var visible = attributes['vdl-visible'];
    if (visible) {
        if (visible.expression.isString || _.isEmpty(visible.expression.value)) {
            throw Error('vdl-visible has to be an expression');
        }
        paramsBuilder.addRawOrExpressionParam('visible', visible);
        $element.removeAttr('vdl-visible');
    }
    var width = attributes['width'];
    if (width) {
        paramsBuilder.addRawOrExpressionParam('width', width);
        // Remove the width attribute from the vdlx-datagrid-column as it has implications on page layout
        $element.removeAttr('width');
    }
    var style = attributes['class'];
    if (style) {
        paramsBuilder.addRawOrExpressionParam('style', style);
        // Remove the class attribute from the vdlx-datagrid-column as it has implications on styling for the hidden element
        $element.removeAttr('class');
    }
    var sortByFormatted = attributes['sort-by-formatted'];
    if (sortByFormatted && sortByFormatted.rawValue === 'true') {
        paramsBuilder.addParam('sortByFormatted', true);
    }
    var filterByFormatted = attributes['filter-by-formatted'];
    if (filterByFormatted) {
        if (filterByFormatted.rawValue === 'true') {
            paramsBuilder.addParam('filterByFormatted', true);
        } else if (filterByFormatted.rawValue === 'false') {
            paramsBuilder.addParam('filterByFormatted', false);
        }
    }
    var editorType = attributes['editor-type'];
    var editorTypes = ['checkbox', 'select', 'text'];
    if (editorType && editorTypes.indexOf(editorType.rawValue) !== -1) {
        if (editorType.rawValue === 'select') {
            if (!attributes['editor-options-set'] && !attributes['editor-options']) {
                throw Error(
                    'vdlx-datagrid-column with "editor-type" of "select" needs either the "editor-options-set" or the "editor-options" attribute to be supplied.'
                );
            }
        }
        paramsBuilder.addParam('editorType', editorType.rawValue);
    }
    var editorCheckedValue = attributes['editor-checked-value'];
    if (editorCheckedValue) {
        paramsBuilder.addParam('editorCheckedValue', editorCheckedValue.rawValue);
    }
    var editorUncheckedValue = attributes['editor-unchecked-value'];
    if (editorUncheckedValue) {
        paramsBuilder.addParam('editorUncheckedValue', editorUncheckedValue.rawValue);
    }
    var editorOptionsSet = attributes['editor-options-set'];
    if (editorOptionsSet) {
        var optionsSetEntity = api.getModelEntityByName(editorOptionsSet.rawValue);
        if (!optionsSetEntity) {
            throw Error(
                'vdlx-datagrid-column editor-options-set entity "' +
                editorOptionsSet.rawValue +
                '" does not exist in the model schema.'
            );
        }
        var optionsSetEntityType = optionsSetEntity.getType();
        if (optionsSetEntityType !== enums.DataType.SET) {
            throw Error('Entity "' + editorOptionsSet.rawValue + '" cannot be used as editor-options-set, wrong data type.');
        }
        paramsBuilder.addParam('editorOptionsSet', editorOptionsSet.rawValue);
    }
    var editorOptions = attributes['editor-options'];
    if (editorOptions) {
        if (editorOptions.expression.isString) {
            throw Error('vdlx-datagrid-column attribute "editor-options" must be an expression.');
        }
        paramsBuilder.addFunctionOrExpressionParam('editorOptions', editorOptions.expression.value, ['value', 'rowData']);
    }
    if (editorOptionsSet && editorOptions) {
        throw Error('vdlx-datagrid-column cannot have both editor-options-set and editor-options specified.');
    }
    var editorOptionsIncludeEmpty = attributes['editor-options-include-empty'];
    if (editorOptionsIncludeEmpty) {
        paramsBuilder.addParam('editorOptionsIncludeEmpty', editorOptionsIncludeEmpty.rawValue === 'true');
    }
    var render = attributes['render'];
    if (render) {
        if (render.expression.isString) {
            throw Error('Render parameter has to be an expression');
        }
        paramsBuilder.addParam('render', render.expression.value, true);
    }
    var format = attributes['format'];
    if (format) {
        if (!DataUtils.entityTypeIsNumber(entity)) {
            throw Error('Entity ' + entityName + ' with element type ' + entity.getElementType() + ' cannot be formatted');
        }
        paramsBuilder.addParam('format', format.rawValue);
    }
    var frozen = attributes['frozen'];
    if (frozen) {
        if (frozen.rawValue === 'true') {
            paramsBuilder.addParam('frozen', true);
        } else if (frozen.rawValue === 'false') {
            paramsBuilder.addParam('frozen', false);
        }
    }
};
