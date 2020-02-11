/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-index-filter/index.js
   ```````````````````````
   vdlx-datagrid-index-filter main file.

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
import {VDL} from '../insight-globals';
import metadata from './metadata';
import transform from './transform';
import viewModel from './view-model';

VDL('vdlx-datagrid-index-filter', {
    tag: metadata.tag,
    attributes: metadata.attributes,
    createViewModel: viewModel,
    transform: transform,
    // Apply errors to the parent vdlx-datagrid
    errorTargetSelector: function (element) {
        return $(element).closest('vdlx-datagrid')[0] || element;
    },
    requiredParent: metadata.requiredParent
});
