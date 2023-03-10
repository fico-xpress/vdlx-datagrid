/*
   Xpress Insight vdlx-datatree
   =============================

   file vdlx-datatree/metadata.js
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
    tag: 'vdlx-datatree',
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
                'Use this attribute to pass data directly to vdlx-datatree. Supported formats: Array of key/value objects: [{key:[x,y] value: z}]',
            acceptsExpression: true
        },
        {
            name: 'schema-data',
            description:
                'Use this attribute to pass schema data directly to vdlx-datatree. Supported formats: Object of key/value: {key:[x,y] value: z}]',
            acceptsExpression: true
        },
        {
            name: 'data-tree-start-expanded',
            description:
                'By default, all nodes in the tree will be expanded. The data-tree-start-expanded option can be used to customize the initial expansion state of the tree.',
            acceptsExpression: true,
            defaultValue: true
        },
        {
            name: 'column-filter',
            description:
                'Set this to <em>true</em> to enable the column filters. This will show a header row with filter inputs for each column.'
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
                    description: 'Data for the index columnfs of the row'
                }
            ]
        }
    ]
};
