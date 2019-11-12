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

import { $ } from '../globals';
import { reduce, set, uniqueId, throttle, size, isNumber, isFunction, omit } from 'lodash';
const enums = insightModules.load('enums');
const validatorFactory = insightModules.load('vdl/vdl-validator-factory');
const insightGetter = insightModules.load('insight-getter');

const COLUMN_BUILD_DELAY = 50;
const AUTOCOLUMN_PROP_NAME = 'autotableConfig';

export const viewModel = (params, componentInfo) => {
    var indexFilters$ = ko.observable({});
    var filters$ = ko.pureComputed(function() {
        return reduce(
            indexFilters$(),
            function(memo, filterProps) {
                return set(memo, [filterProps.setName, filterProps.setPosition], filterProps.value);
            },
            {}
        );
    });
    const columnId = uniqueId('datagrid-column');
    var buildColumn = throttle(
        function(done) {
            console.log('vdlx-datagrid update column');
            var columnReady =
                $(componentInfo.element).find('vdlx-datagrid-index-filter').length === size(indexFilters$());
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
            if (size(filters$())) {
                props.filters = filters$();
            }
            if (props.entity) {
                var getValidationFn = function(indices) {
                    var validationProperties = validatorFactory.getValidationProperties({
                        entity: props.entity,
                        indices: indices
                    });
                    var customValidators = validatorFactory.getCustomValidators(
                        validationProperties,
                        componentInfo.element
                    );
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
            if (columnReady) {
                componentInfo.element[AUTOCOLUMN_PROP_NAME] = props;
                isFunction(params.tableUpdate) && params.tableUpdate();
            }
            if (isFunction(done)) {
                done();
            }
        },
        COLUMN_BUILD_DELAY,
        { leading: false }
    );
    var paramsWatcher = ko.computed(function() {
        var constructedParams = {
            scenario: ko.unwrap(params.scenario),
            title: ko.unwrap(params.heading),
            width: ko.unwrap(params.width),
            editable: ko.unwrap(params.editable),
            visible: ko.unwrap(params.visible)
        };
        buildColumn();
        return constructedParams;
    });
    return {
        columnUpdate: buildColumn,
        validate: buildColumn,
        dispose: function() {
            paramsWatcher.dispose();
            isFunction(params.tableUpdate) && params.tableUpdate();
        },
        filterUpdate: function(filterId, filterProperties) {
            indexFilters$(set(indexFilters$(), filterId, filterProperties));
            buildColumn();
        },
        filterRemove: function(filterId) {
            indexFilters$(omit(indexFilters$(), filterId));
            buildColumn();
        }
    };
};
