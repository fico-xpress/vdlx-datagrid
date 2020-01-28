/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/view-model.js
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
import { EDITOR_TYPES } from '../constants';
import { insightModules } from '../insight-globals';
import omit from 'lodash/omit';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import size from 'lodash/size';
import uniqueId from 'lodash/uniqueId';
import set from 'lodash/set';
import reduce from 'lodash/reduce';
import noop from 'lodash/noop';

const enums = insightModules.load('enums');
const validatorFactory = insightModules.load('vdl/vdl-validator-factory');
const insightGetter = insightModules.load('insight-getter');

/** @type {KnockoutStatic} */
const ko = global.ko;

/** @typedef {{element: HTMLElement}} ComponentInfo */

export const AUTOCOLUMN_PROP_NAME = 'autotableConfig';

const createProps = (columnId, params, filters, element) => {
    var props = {
        scenario: ko.unwrap(params.scenario),
        title: ko.unwrap(params.heading),
        width: ko.unwrap(params.width),
        editable: ('' + ko.unwrap(params.editable)).toLowerCase() === 'true',
        visible: !(('' + ko.unwrap(params.visible)).toLowerCase() === 'false'),
        style: params.style,
        sortByFormatted: params.sortByFormatted,
        filterByFormatted: params.filterByFormatted,
        editorOptionsSet: params.editorOptionsSet,
        selectNull: params.editorOptionsIncludeEmpty,
        checkedValue: params.editorCheckedValue,
        uncheckedValue: params.editorUncheckedValue,
        id: columnId,
        bottomCalc: params.bottomCalc
    };
    if (params.bottomCalc) {
        props.bottomCalcFormatter = function(data) {
            var val = data.getValue();
            if (isNumber(val)) {
                return insightGetter().Formatter.formatNumber(val, params.format);
            }
            return val;
        };
    }
    if (params.editorOptions) {
        props.editorOptions = function() {
            // Return an empty list of options if value is undefined
            return params.editorOptions.apply(null, arguments) || [];
        };
    }
    if (isFunction(params.render)) {
        props.render = params.render;
    }
    if (params.format) {
        props.render = (data, type) => {
            var formatCell =
                type === 'display' ||
                (type === 'filter' && params.filterByFormatted) ||
                (type === 'sort' && params.sortByFormatted);
            return formatCell ? insightGetter().Formatter.formatNumber(data, params.format) : data;
        };
        props.format = params.format;
    } else {
        props.format = null;
    }
    if (!!params.entity) {
        props.entity = params.entity;
        if (!params.editorType) {
            const type = insight
                .getView()
                .getProject()
                .getModelSchema()
                .getEntity(params.entity)
                .getElementType();
            switch (type) {
                case enums.DataType.BOOLEAN:
                    props.editorType = EDITOR_TYPES.checkbox;
                    break;
                default:
                    props.editorType = EDITOR_TYPES.text;
                    break;
            }
            // Then overridden by the presence of input options
            if (typeof props.checkedValue !== 'undefined' && typeof props.uncheckedValue !== 'undefined') {
                props.editorType = EDITOR_TYPES.checkbox;
            }
            if (props.editorOptions || props.editorOptionsSet) {
                props.editorType = EDITOR_TYPES.select;
            }
        } else {
            props.editorType = EDITOR_TYPES[params.editorType];
        }
    } else if (!!params.set) {
        props.set = params.set;
    }
    if (params.setPosition != null) {
        props.setPosition = params.setPosition;
    }
    if (size(filters)) {
        props.filters = filters;
    }
    if (props.entity) {
        var getValidationFn = function(indices) {
            var validationProperties = validatorFactory.getValidationProperties({
                entity: props.entity,
                indices: indices
            });
            var customValidators = validatorFactory.getCustomValidators(validationProperties, element);
            return validatorFactory.createFromValidators(customValidators);
        };
        var validationObservable = ko.observable().extend({
            functionObservable: {
                onDependenciesChange: function() {
                    params.tableValidate();
                },
                read: function(indices, value, rowData) {
                    return getValidationFn(indices)(value, rowData);
                },
                disposeWhenDependenciesChange: false
            }
        });
        props.editorValidate = function(newValue, rowData, keys) {
            validationObservable(keys, newValue, rowData);
            return validationObservable.peek();
        };
    }
    return props;
};

const isColumnReady = (/** @type {HTMLElement} */ element, filters) =>
    element.getElementsByTagName('vdlx-datagrid-index-filter').length === size(filters);

export const viewModel = (params, /** @type {ComponentInfo} */ componentInfo) => {
    var indexFilters$ = ko.observable({}).extend({ deferred: true });
    var filters$ = ko.pureComputed(function() {
        return reduce(
            indexFilters$(),
            function(memo, filterProps) {
                return set(memo, [filterProps.setName, filterProps.setPosition], filterProps.value);
            },
            {}
        );
    });

    const columnReady$ = ko.pureComputed(() => isColumnReady(componentInfo.element, filters$()));

    const columnId = uniqueId('datagrid-column');

    const props$ = ko
        .pureComputed(() => {
            const columnReady = ko.unwrap(columnReady$);
            if (!columnReady) {
                return undefined;
            }
            const filters = ko.unwrap(filters$);
            const props = createProps(columnId, params, filters, componentInfo.element);
            return props;
        })
        .extend({
            deferred: true
        });

    const subscription = ko
        .pureComputed(() => {
            const props = props$();
            set(componentInfo.element, AUTOCOLUMN_PROP_NAME, props);
            params.addColumn(columnId);
        })
        .subscribe(noop);

    return {
        dispose: function() {
            subscription.dispose();
            params.removeColumn(columnId);
        },
        filterUpdate: function(filterId, filterProperties) {
            indexFilters$(set(indexFilters$(), filterId, filterProperties));
        },
        filterRemove: function(filterId) {
            indexFilters$(omit(indexFilters$(), filterId));
        }
    };
};
