/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/datagrid-lock.js
   ```````````````````````
   vdlx-datagrid datagrid lock.

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
const LOCK_EVENT_NAMESPACE = '.insight-table-lock';
const events = _.map(
    ['keydown', 'keypress', 'keyup', 'mousedown', 'mouseup', 'click', 'focusin'],
    eventName => eventName + LOCK_EVENT_NAMESPACE
).join(' ');
const WRAPPER_SELECTOR = 'vdlx-datagrid'
const DEFAULT_MESSAGE = 'The table is currently locked';
const TABLE_LOCKED_CLASS = 'insight-table-locked';
const TABLE_LOCKED_OVERLAY_CLASS = 'insight-table-locked-overlay';
const TABLE_LOCKED_OVERLAY_NON_TRANSPARENT_CLASS = 'non-transparent';
const FICO_SPINNER_CLASS = 'fico-spinner';

const OVERLAY_CLASSES = [
    TABLE_LOCKED_OVERLAY_CLASS,
    TABLE_LOCKED_OVERLAY_NON_TRANSPARENT_CLASS,
].join(' ');

export class DatagridLock {
    /**
     * @param {Element} element
     * @memberof DatagridLock
     */
    constructor(element) {
        this.locked = false;
        this.$wrapperElement = $(element).closest(WRAPPER_SELECTOR);
        this.overlayDeferred = null;
    }

    /**
     * @param {String} message
     * @memberof DatagridLock
     */
    lock (message = DEFAULT_MESSAGE) {
        if (this.locked) {
            return;
        }

        this.locked = true;

        this.$wrapperElement
            .addClass(TABLE_LOCKED_CLASS)
            .on(events, function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
            });

        var $overlay = $(`<div class="${OVERLAY_CLASSES}"><div class="${FICO_SPINNER_CLASS}"></div></div>`);
        $overlay.appendTo(this.$wrapperElement);

        this.overlayDeferred = null;
    }

    unlock () {
        if (!this.locked) {
            return;
        }

        this.$wrapperElement
            .off(LOCK_EVENT_NAMESPACE)
            .removeClass(TABLE_LOCKED_CLASS)
            .children(`.${TABLE_LOCKED_OVERLAY_CLASS}`)
            .remove();

        if (this.overlayDeferred) {
            clearTimeout(this.overlayDeferred);
        }

        this.locked = false;
    }

    isLocked () {
        return this.locked;
    }
}
