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
export default {
    tag: 'vdlx-datagrid-validate',
    requiredParent: ['vdlx-datagrid-column'],
    doc: {
        description:
            'Add a validation rule to a <code>&lt;vdlx-datagrid-column&gt;</code> element.' +
            ' You can declare multiple <code>&lt;vdl-validate&gt;</code> rules within a' +
            ' <code>&lt;vdlx-datagrid-column&gt;</code> and they will all be applied. Each rule can specify whether the field is allowed to save data if that rule' +
            ' fails (this is soft validation). The `pass` attribute defines the expression that is called every time the field or autocolumn' +
            ' changes. The expression is automatically given the variables: <code>entityName</code>, <code>value</code>, <code>indices</code> ' +
            ' and <code>rowData</code> (if used with <code>vdlx-datagrid</code>). <code>entityName</code> is the' +
            ' name of the entity bound to the field, <code>value</code> is the current value being input, <code>indices</code> is an array of indices' +
            ' if the field is bound to an array element and rowData is an array containing indices and values of the current row.',
        descriptionAsHtml: true,
        elementContents: {
            description:
                'Text content of the element is used as the message to display when attempting to save and validation fails'
        },
        example:
            '' +
            '<vdlx-datagrid>\n' +
            '  <vdlx-datagrid-column entity="FactoryDemand">\n' +
            '    <vdl-validate pass="=value >= scenario.entities.SupportLevel.value"\n' +
            '                  allow-save="=scenario.entities.CanSave.value">\n' +
            '      FactoryDemand should be greater than or equal to SupportLevel\n' +
            '    </vdl-validate>\n' +
            '  </vdlx-datagrid-column>\n' +
            '</vdlx-datagrid>'
    },
    attributes: [
        {
            name: 'pass',
            description:
                'Expression to used for validating the value of a `<vdl-field>` or `<vdl-table-column>`. This must be an expression and ' +
                'should resolve to either a function or a boolean value. If a function it will be executed on each change to the `vdl-field` or `vdl-table-column` ' +
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
                    description: 'The values from each cell in the current row. The order of the row data reflects the underlying ' +
                        'order of the array indices rather than the display order.'
                }
            ]
        },
        {
            name: 'allow-save',
            description:
                'If set to true this will allow a field to be saved even though it is marked as invalid. Defaults to __false__.',
            acceptsExpression: true
        }
    ]
};
