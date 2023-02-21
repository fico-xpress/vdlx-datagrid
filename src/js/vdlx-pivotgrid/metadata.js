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
        description: `The VDL Pivot Table component is a VDL Extension that provides an interface for users to create interactive pivot tables. 
        Pivot tables are a powerful tool for analyzing and summarizing large datasets. The component allows users to visualize 
        and manipulate data in a variety of ways, such as filtering, sorting, and aggregating data.
        Pivot Table requires grouped data to be passed via the data attribute E.G: 
        <br><br>
[<br>
&nbsp;&nbsp;{ key: [1, 1, 'UK'], value: 100},<br>
&nbsp;&nbsp;{ key: [1, 2, 'USA'], value: 200},<br>
&nbsp;&nbsp;{ key: [1, 2, 'FR'], value: 300},<br>
&nbsp;&nbsp;...<br>
]
<br><br>
VDL actions are available to fetch, group, aggregate and label data. 
        `,
        descriptionAsHtml: true,
        example: `
<vdl-var name="groupedData" value="=[]"></vdl-var>
<vdl-var name="indexSetNames" value="=[]"></vdl-var>
<vdl-var name="labelArrays" value="=[]"></vdl-var>

<vdl-action-group name="getData">
    <vdl-action-get-entity-data entity="CountryStats"></vdl-action-get-entity-data>
    <vdl-action-group-by set-position="=[2,0,1]"></vdl-action-group-by>
    <vdl-action-aggregate></vdl-action-aggregate>
    <vdl-action-set-var var="groupedData"></vdl-action-set-var>
    <vdl-action-get-index-sets entity="CountryStats"></vdl-action-get-index-sets>
    <vdl-action-set-var var="indexSetNames"></vdl-action-set-var>
    <vdl-action command="getLabelArray" vdl-repeat="=name in vars.indexSetNames" value="=name"></vdl-action>
</vdl-action-group>

<vdl-action-group name="getLabelArray">
    <vdl-action-get-entity-data entity="=value" with-labels="true"></vdl-action-get-entity-data>
    <vdl-action-array-push var="labelArrays"></vdl-action-array-push>
</vdl-action-group>

<vdlx-pivotgrid
    data="=vars.groupedData"
    row-dimensions="=['Match']"
    column-dimensions="=['Country', 'Stat']"
    column-titles="=[vars.labelArrays[0],vars.labelArrays[1]]"></vdlx-pivotgrid>        
        `
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
        /*
             row and column indexes drive the pivot table
             they decide which indexes from the keyed data go on which dimension (row, column or both)
             they are extracted from EITHER the row/column-positions OR the row/column-dimensions attributes
             if both are present:
             the row/column-positions attribute will be used for the indexes
             and the row/column-dimensions attribute used for row/column group headings
           */
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
            description: 'Used to define the dimensions pivoted onto the rows. Supported format: An array of row group headings ' +
                '["pivot column a", "pivot column b"], or a number representing the number of dimensions from the original data set that ' +
                'will be used as rows in the pivot grid. Both would result in two row groups, but only the array of strings would ' +
                'result in the groups having headings. Pivoting will always be done by row first, then by column. Only an array of strings is ' +
                'valid when used in conjunction with "row-set-positions".',
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
