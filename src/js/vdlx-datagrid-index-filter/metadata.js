/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-index-filter/metadata.js
   ```````````````````````````````````````````
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
    tag: 'vdlx-datagrid-index-filter',
    requiredParent: ['vdlx-datagrid'],
    attributes: [
        {
            name: 'set',
            description: 'Name of the set entity to filter out of the indices for the column.',
            required: true
        },
        {
            name: 'set-position',
            description:
                'Index (zero-based) of occurrence of that index set in the index tuple for the array. Defaults to zero.'
        },
        {
            name: 'value',
            description: 'Single value to fix the indices to.',
            acceptsExpression: true,
            required: true
        }
    ]
};