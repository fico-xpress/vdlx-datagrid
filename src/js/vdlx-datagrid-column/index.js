/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/index.js
   ```````````````````````
   vdlx-datagrid-column extension.

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
import { VDL } from '../insight-globals';
import { VDGCattributes } from './attributes';
import { transform } from './transform';
import { viewModel } from './view-model';
/*
    vdlx-datagrid-column

    To be used as the direct child of <vdlx-datagrid>. <vdlx-datagrid-column may be used multiple times within its parent.
    One of these tags directly generates a column in the resulting Datagrid.

    This tag creates config to tell its parent how to populate the datagrid column.
    */

VDL('vdlx-datagrid-column', {
    tag: 'vdlx-datagrid-column',
    attributes: VDGCattributes,
    // Apply errors to the parent vdlx-datagrid element
    errorTargetSelector: function(element) {
        // error is displayed on autotable, or if there isn't one, the parent
        // will have to do as as default
        return $(element).closest('vdlx-datagrid')[0] || element;
    },

    template: '<vdl-contents></vdl-contents>',

    modifiesDescendants: false,

    createViewModel: viewModel,

    transform: transform
});
