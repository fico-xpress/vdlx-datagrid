/*
   Xpress Insight vdlx-pivotgrid
   =============================

   file vdlx-pivotgrid/metadata.js
   ``````````````````````````````
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
export default {
    tag: 'vdlx-pivotgrid',
    modifiesDescendants: false,
    doc: {
        description: `description required`,
        descriptionAsHtml: true,
        example: `example required`
    },
    attributes: [
        {
            name: 'id',
            description:
                'Specify an element id for the grid. Useful if you later want to target the grid using a selector. ' +
                'If not given then an id will be generated.'
         },
        {
            name: 'page-size',
            description: 'The number of rows to show per-page in paged mode.',
            acceptsExpression: true,
            defaultValue: '50'
        },
        {
            name: 'page-mode',
            description:
                'By default the grid will show all rows in scrolling mode. Set this attribute to <em>paged</em> to enable grid pagination.'
        },
        {
            name: 'height',
            acceptsExpression: true,
            description:
                'Grid height, When page-mode is set to <em>scrolling</em> you can set the height of the grid to something other than the default.',
            defaultValue: '600'
        },
        {
            name: 'width',
            description: 'Set the grid to a fixed width, in pixels. Accepts an integer value. ' +
                'If set to the string <em>custom</em> then the grid width is calculated by adding up all the widths of the columns in the grid. ' +
                "If a column doesn't have a width specified then it is given a default value of <em>100px</em>.",
            acceptsExpression: false
        },
        {
            name: 'class',
            description: 'Space-separated list of the classes of the element.',
            acceptsExpression: false
        },
        {
            name: 'always-show-selection',
            description:
                'Whether to display selection on inactive grids. Set to <em>true</em> to keep selection on a grid when it becomes inactive.',
            acceptsExpression: false,
            defaultValue: false
        },
        {
            name: 'data',
            description:
                'Use this attribute to pass data directly to vdlx-pivotgrid. Supported formats: Array of key/value objects: [{key:[x,y] value: z}]',
            acceptsExpression: true
        },
        {
            name: 'column-dimensions',
            description: 'Used to define the dimensions pivoted onto the columns. Supported format: An array of column group headings ' +
                '["pivot column a", "pivot column b"], or a number representing the number of dimensions from the original data set that ' +
                'will be used as columns in the pivot grid. Both would result in two columns groups, but only the array of strings would ' +
                'result in the groups having headings. Pivoting will always be done by row first, then by column. Only an array of strings is ' +
                'valid when used in conjunction with "column-set-positions".',
            expression: 'all',
            mutexGroup: 'COLUMN_SELECTION'
        },
        {
            name: 'column-set-position',
            description: 'The position of the keys that are used to produce the columns of the pivot grid. You can specify a single value or ' +
                'an array. For example: key[x,y,z] to pivot by y column-set-positions="1", or to pivot by z and x column-set-positions="=[2,0]".',
            expression: 'all',
            mutexGroup: 'COLUMN_SELECTION'

        },
        {
            name: 'column-titles',
            description: 'An array of arrays used to decorate the column titles, supported formats are; Array of strings ["Column 1", "Column 2"], ' +
                'or an array of value/label objects: [{value:x label: "x label"}]. One array per dimension. When using the value/label array, the ' +
                'value represents the column index and the label the string that will be used to for the column heading.',
            expression: 'all',
            defaultValue: []
        },
        {
            name: 'show-column-calc',
            description: 'Display a calculated cell displaying the total for each column.',
            expression: 'all',
            defaultValue: 'true'
        },
        {
            name: 'row-dimensions',
            description: 'Used to define the dimensions pivoted onto the rows.  Supported format: An array of row group ' +
                'headings ["pivot row a", "pivot row b"], or a the of row group headings "2". ' +
                'Both would result in two row groups, but only the array of strings would result in the rows having headings. ' +
                'Pivoting will always be done by row first, then by column.  ' +
                'Only an array of strings is valid when used in conjunction with "row-set-positions".',
            expression: 'all',
            mutexGroup: 'ROW_SELECTION'
        },
        {
            name: 'row-set-position',
            description: 'The position of the key or keys you wish to pivot onto the rows.  ' +
                'You can specify a single value or an array.  ' +
                'For example: key[x,y,z] to pivot by y row-set-positions="1", or ' +
                'to pivot by z and x row-set-positions="=[2,0]". The default value is 0.',
            expression: 'all',
            mutexGroup: 'ROW_SELECTION',
            defaultValue: 0
        },
        {
            name: 'row-titles',
            description: 'An array of arrays used to decorate the row titles, supported formats are; Array of strings ["Column 1", "Column 2"], ' +
                'or an array of value/label objects: [{value:x label: "x label"}].  One array per dimension.',
            expression: 'all',
            defaultValue: []
        },
        {
            name: 'show-row-calc',
            description: 'Display a calculated cell displaying the total for each row.',
            expression: 'all',
            defaultValue: 'true'
        },
        {
            name: 'row-filter',
            description:
                'Expression to be used for filtering the rows of a &lt;vdl-datagrid&gt;. This must be an expression and ' +
                'should resolve to either a function or a boolean value. If a function it will be executed when grid updates. ' +
                'The function will have the following signature (rowData, indices) and should return a boolean.',
            acceptsExpression: true,
            required: false,
            expressionVars: [
                {
                    name: 'rowData',
                    type: 'Array.<(string|boolean|number)>',
                    description: 'The values from each cell in the current row. The order of the row data reflects the underlying ' +
                        'order of the array indices rather than the display order.'
                },
                {
                    name: 'indices',
                    type: 'Array.<(string|boolean|number)>',
                    description: 'Data for the index columns of the row'
                }
            ]
        }
    ]
};
