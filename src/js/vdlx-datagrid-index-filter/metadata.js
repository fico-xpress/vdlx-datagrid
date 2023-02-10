/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-index-filter/metadata.js
   ```````````````````````````````````````````
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
    tag: 'vdlx-datagrid-index-filter',
    doc: {
        description: `<p>This tag can be used at either the <code>vdlx-datagrid</code> level or the <code>vdlx-datagrid-column</code>
            level.</p>
            
            <p>When used at the <code>vdlx-datagrid-column</code> level, it can only accept a single value and will filter 
            the specified index set for the array entity associated with that column. Note that it will not reduce the amount 
            of data fetched from the server when used at the column level.</p>
            
            <p>When used at the <code>vdlx-datagrid</code> level, it can accept one or more values and will filter the specified 
            index set for all arrays in the table. This will request the filtered data from the server, so reduce the amount
            of data that is fetched from the server and processed by the table, resulting in improved performance. The filtered 
            index set will still be shown as a column in the table, so you will need to use <code>vdl-visible="=false"</code>
            to hide this if necessary.</p>`,
        descriptionAsHtml: true,
        example: `<!-- Example of an index filter on a column -->
<vdlx-datagrid>
    <vdlx-datagrid-column entity="FactoryDemand" heading="='Factory Demand (' + vars.filterValue + ')'">
        <vdlx-datagrid-index-filter set="Factories" value="=vars.filterValue"></vdlx-datagrid-index-filter>
    </vdlx-datagrid-column>
</vdlx-datagrid>

<!-- Example of a server-side index filter on an entire table -->
<vdlx-datagrid vdl-if="=vars.multiFilter.length > 0">
    <vdlx-datagrid-index-filter set="MonthsOfYear" value="=vars.multiFilter"></vdlx-datagrid-index-filter>
    <vdlx-datagrid-column entity="FactorySupply"></vdlx-datagrid-column>
</vdlx-datagrid>`
    },
    requiredAncestor: ['vdlx-datagrid', 'vdlx-datagrid-column'],
    attributes: [
        {
            name: 'set',
            description: 'Name of the set entity to filter out of the indices for the column.',
            required: true
        },
        {
            name: 'set-position',
            description:
                'Index (zero-based) of occurrence of that index set in the index tuple for the array.',
            defaultValue: '0'
        },
        {
            name: 'value',
            description: 'Single value to fix the indices to. If used at the <code>vdlx-datagrid</code> level, the value ' +
                'will accept multiple values in the form of an array or a vdl-var',
            acceptsExpression: true,
            required: true
        }
    ]
};