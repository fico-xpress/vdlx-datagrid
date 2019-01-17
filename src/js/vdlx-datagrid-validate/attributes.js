/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-validate/attributes.js
   ```````````````````````
   vdlx-datagrid-validate attributes.

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
export default [
    {
        name: 'pass',
        description: 'Expression to used for validating the value of a <vdl-field> or <vdl-table-column>. This must be an expression and ' +
            'should resolve to either a function or a boolean value. If a function it will be executed on each change to the vdl-field or vdl-table-column ' +
            'and also when a save is attempted. The function will have the following signature (entityName, value, key) and should return a boolean.',
        acceptsExpression: true,
        required: true,
        expressionVars: [
            {
                name: 'entityName',
                type: 'string',
                description: 'Name of the entity being validated'
            },
            {
                name: 'value',
                type: '(string|boolean|number)',
                description: 'Value to be validated. The data type depends on the user input binding'
            },
            {
                name: 'indices',
                type: '?Array.<(string|boolean|number)>',
                description: 'Optional array indices provided when binding to an array element'
            },
            {
                name: 'rowData',
                type: '?Array.<(string|boolean|number)>',
                description: 'Optional array containing indices and values of the current row.' +
                    ' Provided when tag is used in combination with vdl-table.'
            }
        ]
    },
    {
        name: 'allow-save',
        description: 'If set to true this will allow a field to be saved even though it is marked as invalid. Defaults to false',
        acceptsExpression: true
    }
]