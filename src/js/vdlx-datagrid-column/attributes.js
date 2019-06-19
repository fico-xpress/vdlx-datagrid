/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/attributes.js
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
export var VDGCattributes = [
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
    },
    {
        name: 'bottom-calc',
        description: 'Specify a built-in calculation, one of avg, max, min, sum, concat or count to show that calculated value, ' +
            'alternatively provide a custom function, as a dynamic expression.',
        acceptsExpression: true,
        expressionVars: [
            {
                name: 'values',
                type: '(string|boolean|number)',
                description: 'Array of column values'
            },
            {
                name: 'data',
                type: 'string',
                description: 'All table data'
            },
            {
                name: 'calcParams',
                type: 'Array.<(string|boolean|number)>',
                description: 'params passed from the column definition object'
            }
        ]

    }
];
