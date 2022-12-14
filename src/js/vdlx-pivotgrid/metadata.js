/*
   Xpress Insight vdlx-pivotgrid
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
    tag: 'vdlx-pivotgrid',
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
        // todo - potentially we could called it - grouped-data?
        {
            name: 'data',
            description:
                'Use this attribute to pass data directly to vdlx-datagrid. Supported formats are; array of primitives: [1,2,3], Array of objects: [{... prop: 1}], ' +
                'or an array of arrays: [...["a",1]] ',
            acceptsExpression: true
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
            name: 'row-set-positions',
            description: 'The position of the key or keys you wish to pivot onto the rows.  ' +
                'You can specify a single value or an array.  ' +
                'For example: key[x,y,z] to pivot by y row-set-positions="1", or ' +
                'to pivot by z and x row-set-positions="=[2,0]" The default value is 0.  ',
            expression: 'all',
            defaultValue: 0,
            mutexGroup: 'ROW_SELECTION'
        },
        {
            name: 'column-set-positions',
            description: 'The position of the key or keys you wish to pivot onto the columns.  ' +
                'You can specify a single value or an array.  ' +
                'For example: key[x,y,z] to pivot by y col-set-positions="1", or ' +
                'to pivot by z and x col-set-positions="=[2,0]" The default value is 1.  ',
            expression: 'all',
            defaultValue: 1,
            mutexGroup: 'COLUMN_SELECTION'
        },

        {
            name: 'row-count',
            description: 'Just an idea - instead of passing set positions - we send the amount of each' +
                'e.g, 1 x rows, 2 x cols',
            expression: 'all',
            defaultValue: 1,
            mutexGroup: 'ROW_SELECTION'
        },
        {
            name: 'column-count',
            description: 'Just an idea - instead of passing set positions - we send the amount of each' +
                'e.g, 1 x rows, 2 x cols',
            expression: 'all',
            defaultValue: 1,
            mutexGroup: 'COLUMN_SELECTION'
        },

        {
            name: 'headers',
            description: 'The column and/or row headers, accepts an array of strings.',
            expression: 'all',
            defaultValue: []
        },
        {
            name: 'labels',
            description: 'The label arrays for the data, accepts an array of label arrays. The order is by rows and then columns.',
            expression: 'all',
            defaultValue: []
        }
    ]
};
