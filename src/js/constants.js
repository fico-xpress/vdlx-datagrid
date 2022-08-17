/*
   Xpress Insight vdlx-datagrid
   =============================

   file constants.js
   ```````````````````````
   vdlx-datagrid editor type constants.

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
export const EDITOR_TYPES = {
    text: 'input',
    checkbox: 'checkbox',
    select: 'select'
};

export const COLUMN_SORTERS = {
    alphanum: 'alphanum',
    array: 'array',
    boolean: 'boolean',
    number: 'number',
    string: 'string'
};

export const ROW_DATA_TYPES = {
    object: 'object',
    array: 'array',
    primitive: 'primitive',
    function: 'function'
};

export const CUSTOM_COLUMN_DEFINITION = {
    AUTO: 'auto',
    LABELS: 'labels',
    OBJECT: 'object'
};

export const APPROVED_COLUMN_PROPS = {
    title: 'docs for the title prop',
    field: 'docs for the field prop',
    visible: 'docs for the visible prop',
    vertAlign: 'docs for the vertAlign prop',
    headerHozAlign: 'docs for the prop',
    width: 'docs for the prop',
    minWidth: 'docs for the prop',
    maxWidth: 'docs for the prop',
    frozen: 'docs for the prop',
    cssClass: 'docs for the prop',
    sorter: 'docs for the prop',
    formatter: 'docs for the prop',
    editable: 'docs for the prop',
    editor: 'docs for the prop',
    contextMenu: 'a fancy context menu',
    cellClick: 'cell click handler'
};

// const approveProps = ['title', 'field', 'visible', 'hozAlign','vertAlign', 'headerHozAlign', 'width', 'minWidth', 'maxWidth',
//     'frozen', 'cssClass', 'sorter', 'formatter', 'editable', 'editor'];

