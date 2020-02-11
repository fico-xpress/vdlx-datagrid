/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/metadata.js
   ``````````````````````````````
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
export default {
    tag: 'vdlx-datagrid',
    modifiesDescendants: false,
    doc: {
        example: `<vdlx-datagrid>
    <vdlx-datagrid-column entity="MY_ARRAY_1"></vdlx-datagrid-column>
    <vdlx-datagrid-column entity="MY_ARRAY_2"></vdlx-datagrid-column>
</vdlx-datagrid>`
    },
    attributes: [
        {
            name: 'id',
            description:
                'Specify an element id for the grid. Useful if you later want to target the grid using a selector. ' +
                'If not given then an id will be generated.'
        },
        {
            name: 'scenario',
            description:
                'The default scenario to use for fetching data in the grid. This can be overridden per column but the default ' +
                'will be used when a column does not specify a particular scenario and the index sets will be fetched from the default scenario.',
            acceptsExpression: true
        },
        {
            name: 'page-size',
            description: 'The number of rows to show per-page in paged mode. Defaults to 50.',
            acceptsExpression: true
        },
        {
            name: 'page-mode',
            description:
                'By default the grid will show all rows in scrolling mode. Set this attribute to "paged" to enable grid pagination.'
        },
        {
            name: 'height',
            acceptsExpression: true,
            description:
                'Grid height, When page-mode is set to "scrolling" you can set the height of the grid to something other than the default 600'
        },
        {
            name: 'column-filter',
            description:
                'Set this to "true" to enable the column filters. This will show a header row with filter inputs for each column.'
        },
        {
            name: 'add-remove-row',
            description:
                'Setting this will show the add-remove row buttons at the bottom of the grid. Set to "true" ' +
                'to prompt for index selection on row add. Set to "addrow-autoinc" will switch the behaviour to allow new ' +
                'index values to be created, incrementing from the highest value in the set(s).'
        },
        {
            name: 'width',
            description:
                'Set the grid to a fixed width, in pixels. Accepts an integer value. ' +
                'If set to the string "custom" then the grid width is calculated by adding up all the widths of the columns in the grid. ' +
                "If a column doesn't have a width specified then it is given a default value of 100px.",
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
                'Whether to display selection on inactive grids. Set to "true" to keep selection on a grid when it becomes inactive. Defaults to false.',
            acceptsExpression: false
        },
        {
            name: 'row-filter',
            description:
                'Expression to be used for filtering the rows of a <vdl-datagrid>. This must be an expression and ' +
                'should resolve to either a function or a boolean value. If a function it will be executed when grid updates. ' +
                'The function will have the following signature (rowData, indices) and should return a boolean.',
            acceptsExpression: true,
            required: false,
            expressionVars: [
                {
                    name: 'rowData',
                    type: 'Array.<(string|boolean|number)>',
                    description: 'Data for all row cells'
                },
                {
                    name: 'indices',
                    type: 'Array.<(string|boolean|number)>',
                    description: 'Data for the index columns of the row'
                }
            ]
        },
        {
            name: 'save-state',
            description:
                'Set this to "false" to disable grid state saving. By default grid state is stored in the ' +
                "user's browser session so that user settings (e.g. page, sorting and search) are preserved if grid data " +
                'is reloaded. Defaults to true.',
            acceptsExpression: false,
            required: false
        },
        {
            name: 'grid-data',
            acceptsExpression: true
        },
        {
            name: 'freeze-columns',
            description: 'The number of columns to freeze in the table starting from the left hand column.',
            required: false
        },
        {
            name: 'show-export',
            description: 'Set this to true to display an export to CSV button.',
            acceptsExpression: true,
            required: false,
            defaultValue: false
        },
        {
            name: 'export-filename',
            description: 'The name of the file exported from the table. A file extension will be assigned.',
            acceptsExpression: true,
            required: false,
            defaultValue: 'data'
        }
    ]
};