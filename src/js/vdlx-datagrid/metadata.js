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
        description: `Render a table of related array entities. The array entities for each column are defined as child
            <code>&lt;vdlx-datagrid-column&gt;</code> elements. The common index sets are automatically detected.
            The table will emit the following events on user interaction: <ul>
            <li><code>selection-changed</code> - Triggered whenever the selection is changed, e.g. when user creates new selection. This event is triggered on the vdlx-datagrid element. Event handler also receives context of the selection, which includes selection cell list, active cell and selection type.</li>
            <li><code>selection-removed</code> - Triggered whenever the selection is destroyed, e.g. when sorting and filtering. This event is triggered on the vdlx-datagrid element.</li>
            </ul>See the JavaScript API Documentation, Table section for more details on the events.`,
        descriptionAsHtml: true,
        example: `<vdl-var name="selectedRowData" value="=[]"></vdl-var>

<vdl-action-group name="handleSelectionChanged">
    <vdl-action-set-var var="selectedRowData" value="=value ? value.activeCell.rowData : []"></vdl-action-set-var>
</vdl-action-group>

<vdl-action-group name="handleSelectionRemoved">
    <vdl-action-set-var var="selectedRowData" value="=[]"></vdl-action-set-var>
</vdl-action-group>

<vdlx-datagrid vdl-event="'selection-changed':handleSelectionChanged, 'selection-removed':handleSelectionRemoved">
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
                'will be used when a column does not specify a particular scenario and the index sets will be fetched from the default scenario. ' +
                'This attribute will not affect the scenario variable in any render expression on the datagrid columns.',
            acceptsExpression: true
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
            name: 'column-filter',
            description:
                'Set this to <em>true</em> to enable the column filters. This will show a header row with filter inputs for each column.'
        },
        {
            name: 'add-remove-row',
            description:
                'Setting this will show the add-remove row buttons at the bottom of the grid. Set to "true" ' +
                'to prompt for index selection on row add. Set to <em>addrow-autoinc</em> will switch the behaviour to allow new ' +
                'index values to be created, incrementing from the highest value in the set(s).'
        },
        {
            name: 'width',
            description:
                'Set the grid to a fixed width, in pixels. Accepts an integer value. ' +
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
        },
        {
            name: 'save-state',
            description:
                'Set this to <em>false</em> to disable grid state saving. By default grid state is stored in the ' +
                "user's browser session so that user settings (e.g. page, sorting and search) are preserved if grid data " +
                'is reloaded.',
            acceptsExpression: false,
            required: false,
            defaultValue: true
        },
        {
            name: 'data',
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
        },
        {
            name: 'column-modifier',
            description: 'Function to modify the column configuration for advanced settings.',
            expression: 'dynamic'
        }
    ]
};
