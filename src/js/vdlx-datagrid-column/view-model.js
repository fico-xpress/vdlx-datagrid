/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid-column/view-model.js
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
import omit from 'lodash/omit';
import size from 'lodash/size';
import uniqueId from 'lodash/uniqueId';
import set from 'lodash/set';
import reduce from 'lodash/reduce';
import noop from 'lodash/noop';
import mapValues from 'lodash/mapValues';
import defer from 'lodash/defer';
import { withDeepEquals, createMutationObservable, withDeferred } from '../ko-utils';
import { createProps } from './create-column-props';
import { ko } from '../insight-modules';

/** @typedef {{element: HTMLElement}} ComponentInfo */

export default (params, /** @type {ComponentInfo} */ componentInfo) => {
    const mutation$ = createMutationObservable(componentInfo.element, { childList: true });

    const indexFilterTagsCount$ = ko.pureComputed(() => {
        mutation$();
        return componentInfo.element.getElementsByTagName('vdlx-datagrid-index-filter').length;
    });

    const indexFilters$ = ko.observable({});

    const filters$ = withDeepEquals(ko.pureComputed(() => {
        if (indexFilterTagsCount$() !== size(indexFilters$())) {
            return filters$.peek();
        }

        return reduce(
            indexFilters$(),
            (memo, filterProps) => set(memo, [filterProps.setName, filterProps.setPosition], filterProps.value),
            {}
        );
    }));

    const columnId = uniqueId('datagrid-column');
    componentInfo.element.columnId = columnId;

    const props$ = withDeferred(withDeepEquals(
        ko.pureComputed(() => {
            const unwrappedParams =mapValues(params, ko.unwrap);
            const filters = ko.unwrap(filters$);
            if(!filters) {
                return props$.peek();
            }
            return createProps(columnId, unwrappedParams, filters, componentInfo.element);
        })
    ));

    const subscription = ko
        .pureComputed(() => {
            const props = props$();
            if (props) {
                params.addColumn(columnId, props);
            } else {
                params.removeColumn(columnId);
            }
        })
        .subscribe(noop);

    return {
        dispose: function() {
            subscription.dispose();
            params.removeColumn(columnId);
        },

        filterUpdate: function(filterId, filterProperties) {
            indexFilters$({
                ...indexFilters$.peek(),
                [filterId]: filterProperties
            });
        },

        filterRemove: function(filterId) {
            return indexFilters$(omit(indexFilters$.peek(), filterId));
        },

        validate: () => {
            params.tableValidate();
        }
    };
};
