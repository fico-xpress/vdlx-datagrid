/*
    vdlx-datagrid-column

    To be used as the direct child of <vdlx-datagrid>. <vdlx-datagrid-column may be used multiple times within its parent.
    One of these tags directly generates a column in the resulting Datagrid.

    This tag creates config to tell its parent how to populate the datagrid column.
    */

var enums = insightModules.load('enums');
var validatorFactory = insightModules.load('vdl/vdl-validator-factory');
var insightGetter = insightModules.load('insight-getter');
var RenderCallbacks = insightModules.load('components/table/render-callbacks');
var DataUtils = insightModules.load('utils/data-utils');

var COLUMN_BUILD_DELAY = 50;
var AUTOCOLUMN_PROP_NAME = 'autotableConfig';

/*
    vdlx-datagrid-column attributes

    TODO do we need to add extra properties for the datagrid?
    */
var VDGCattributes = [
    {
        name: 'entity',
        description: 'Name of the array entity to show in this column. Throws an error if the entity doesn\'t exist or is not an array or set type.',
        required: false
    },
    {
        name: 'set',
        description: 'Name of the set entity to show in this column. Throws an error if the entity doesn\'t exist or is not a set type.',
        required: false
    },
    {
        name: 'set-position',
        description: 'Index (zero-based) of occurrence of that index set in the index tuple for the array.' +
            'Defaults to next available position.'
    },
    {
        name: 'scenario',
        description: 'The scenario id/index for this column. Not allowed on index column (when specifying a set entity)',
        acceptsExpression: true
    },
    {
        name: 'editable',
        description: 'Whether the cells within this column are editable.',
        acceptsExpression: true
    },
    {
        name: 'vdl-visible',
        acceptsExpression: true,
        docIgnore: true
    },
    {
        name: 'heading',
        description: 'A custom header for this column, will default to be the entity alias. ' +
            'Alternatively, you can set the title as the text contents of the <vdlx-datagrid-column> element.',
        acceptsExpression: true
    },
    {
        name: 'width',
        description: 'The width, in pixels, to set the column.',
        acceptsExpression: true
    },
    {
        name: 'class',
        description: 'CSS classes to add to the table column cells. You can provide multiple classes separated by spaces.',
        acceptsExpression: true
    },
    {
        name: 'sort-by-formatted',
        description: 'Use formatted values for sorting.'
    },
    {
        name: 'filter-by-formatted',
        description: 'Use formatted values for filtering. This defaults to false unless the entity has a label in which case the default is true.'
    },
    {
        name: 'editor-type',
        description: 'The editor type to use, in edit mode, for cells in this column. If not specified then it ' +
            'will be autodetected based on entity type. Possible values: checkbox, select, text'
    },
    {
        name: 'editor-checked-value',
        description: 'The value to set the cell data to if input type is checkbox and it is checked.'
    },
    {
        name: 'editor-unchecked-value',
        description: 'The value to set the cell data to if input type is checkbox and it is not checked.'
    },
    {
        name: 'editor-options-set',
        description: 'Name of a set entity to use for select options. This will display labels if a labels entity ' +
            'is defined against this set. This will automatically set the editor-type to be "select".'
    },
    {
        name: 'editor-options',
        description: 'An expression that results in one of the follow to be used as the select options: an array ' +
            'of values, an object of property to value or an array of objects containing key and value properties. ' +
            'This will automatically set the editor-type to be "select".',
        acceptsExpression: true,
        expressionVars: [
            {
                name: 'value',
                type: '(string|boolean|number)',
                description: 'The value of the cell. Its data type will match that of the array elements in this column.'
            },
            {
                name: 'rowData',
                type: 'Array.<(string|boolean|number)>',
                description: 'The values from each cell in the current row'
            }
        ],
        expressionReturns: {
            type: 'Array.<*>|Object.<string, string>|Array.<{key: string, value: *}>',
            description: 'An array of values, an object of property to value or an array of objects containing key and value properties'
        }
    },
    {
        name: 'editor-options-include-empty',
        description: 'Allow array elements to be removed using the select input. Setting this to true will add ' +
            'a blank item to the top of the select list. Defaults to false.'
    },
    {
        name: 'render',
        description: 'Reference to a custom cell renderer. Overrides any default entity rendering. This will be used to generate the cell value ' +
            'for rendering, filtering and sorting. It must be an expression and resolves as a function, this function should return a string.',
        acceptsExpression: true,
        expressionVars: [
            {
                name: 'data',
                type: '(string|boolean|number)',
                description: 'The value of the cell being rendered. Its data type will match that of the array elements in this column.'
            },
            {
                name: 'type',
                type: 'string',
                description: 'The type call data requested - this will be "filter", "display", "type" or "sort"'
            },
            {
                name: 'row',
                type: 'Array.<(string|boolean|number)>',
                description: 'The values from each cell in the current row'
            }
        ]
    },
    {
        name: 'format',
        description: 'Specify a number formatting string. Only applicable to array elements of type integer, real, ' +
            'decision variable and constraint. The formatting syntax is explained in the Xpress Insight Developer Guide.'
    }
];

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
                editorType: params.editorType,
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
                props.render = RenderCallbacks.markAsBuiltinRenderCallback(function (data, type) {
                    var formatCell = type === 'display'
                        || (type === 'filter' && params.filterByFormatted)
                        || (type === 'sort' && params.sortByFormatted);

                    return formatCell ? insightGetter().Formatter.formatNumber(data, params.format) : data;
                });

                props.format = params.format;
            } else {
                props.format = null;
            }

            if (!!params.entity) {
                props.entity = params.entity;
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