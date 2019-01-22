/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/index.js
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
import { EDITOR_TYPES } from "../constants";
import { VDGCattributes } from "./attributes";

/*
    vdlx-datagrid-column

    To be used as the direct child of <vdlx-datagrid>. <vdlx-datagrid-column may be used multiple times within its parent.
    One of these tags directly generates a column in the resulting Datagrid.

    This tag creates config to tell its parent how to populate the datagrid column.
    */

var enums = insightModules.load('enums');
var validatorFactory = insightModules.load('vdl/vdl-validator-factory');
var insightGetter = insightModules.load('insight-getter');
var DataUtils = insightModules.load('utils/data-utils');

var COLUMN_BUILD_DELAY = 50;
var AUTOCOLUMN_PROP_NAME = 'autotableConfig';

VDL('vdlx-datagrid-column', {
    tag: 'vdlx-datagrid-column',
    attributes: VDGCattributes,
    // Apply errors to the parent vdlx-datagrid element
    errorTargetSelector: function (element) {
        // error is displayed on autotable, or if there isn't one, the parent
        // will have to do as as default
        return $(element).closest('vdlx-datagrid')[0] || element;
    },

    template: '<vdl-contents></vdl-contents>',

    modifiesDescendants: false,

    createViewModel: function (params, componentInfo) {

        var indexFilters$ = ko.observable({});
        var filters$ = ko.pureComputed(function () {
            return _.reduce(indexFilters$(), function (memo, filterProps) {
                return _.set(memo, [filterProps.setName, filterProps.setPosition], filterProps.value);
            }, {});
        });

        const columnId = _.uniqueId('datagrid-column');

        var buildColumn = _.throttle(function (done) {
            console.log('vdlx-datagrid update column');
            var columnReady = $(componentInfo.element).find('vdlx-datagrid-index-filter').length === _.size(indexFilters$());

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
                id: columnId 
            };

            if (params.editorOptions) {
                props.editorOptions = function () {
                    // Return an empty list of options if value is undefined
                    return params.editorOptions.apply(null, arguments) || [];
                };
            }

            if (_.isFunction(params.render)) {
                props.render = params.render;
            }

            if (params.format) {
                props.render = (data, type) => {
                    var formatCell = type === 'display'
                        || (type === 'filter' && params.filterByFormatted)
                        || (type === 'sort' && params.sortByFormatted);

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
                            props.editorType = EDITOR_TYPES.checkbox
                            break;
                        default:
                            props.editorType = EDITOR_TYPES.text;
                            break;
                    }

                    // Then overridden by the presence of input options
                    if ((typeof props.checkedValue !== 'undefined') && (typeof props.uncheckedValue !== 'undefined')) {
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

            if (_.size(filters$())) {
                props.filters = filters$();
            }

            if (props.entity) {
                var getValidationFn = function (indices) {
                    var validationProperties = validatorFactory.getValidationProperties({
                        entity: props.entity,
                        indices: indices
                    });

                    var customValidators = validatorFactory
                        .getCustomValidators(validationProperties, componentInfo.element);

                    return validatorFactory.createFromValidators(customValidators);
                };

                var validationObservable = ko.observable().extend({
                    functionObservable: {
                        onDependenciesChange: function () {
                            params.tableValidate();

                        },
                        read: function (indices, value, rowData) {
                            return getValidationFn(indices)(value, rowData);
                        },
                        disposeWhenDependenciesChange: false
                    }
                });

                props.editorValidate = function (newValue, rowData, keys) {
                    validationObservable(keys, newValue, rowData);
                    return validationObservable.peek();
                };
            }

            if (columnReady) {
                componentInfo.element[AUTOCOLUMN_PROP_NAME] = props;
                _.isFunction(params.tableUpdate) && params.tableUpdate();
            }

            if (_.isFunction(done)) {
                done();
            }

        }, COLUMN_BUILD_DELAY, { leading: false });

        var paramsWatcher = ko.computed(function () {
            var constructedParams = {
                scenario: ko.unwrap(params.scenario),
                title: ko.unwrap(params.heading),
                width: ko.unwrap(params.width),
                editable: ko.unwrap(params.editable),
                visible: ko.unwrap(params.visible),
            };

            buildColumn();

            return constructedParams;
        });

        return {
            columnUpdate: buildColumn,
            validate: buildColumn,
            dispose: function () {
                paramsWatcher.dispose();
                _.isFunction(params.tableUpdate) && params.tableUpdate();
            },
            filterUpdate: function (filterId, filterProperties) {
                indexFilters$(_.set(indexFilters$(), filterId, filterProperties));
                buildColumn();
            },
            filterRemove: function (filterId) {
                indexFilters$(_.omit(indexFilters$(), filterId));
                buildColumn();
            }
        };
    },

    transform: function (element, attributes, api) {

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
            throw Error('The "scenario" attribute cannot be used in combination with the "set" attribute on a <vdlx-datagrid-column>.');
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

        var paramsBuilder = api.getComponentParamsBuilder(element)
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
                    throw Error('vdlx-datagrid-column with "editor-type" of "select" needs either the "editor-options-set" or the "editor-options" attribute to be supplied.');
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
                throw Error('vdlx-datagrid-column editor-options-set entity "' + editorOptionsSet.rawValue + '" does not exist in the model schema.');
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
            paramsBuilder.addFunctionOrExpressionParam(
                'editorOptions',
                editorOptions.expression.value,
                ['value', 'rowData']);
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
    }
});