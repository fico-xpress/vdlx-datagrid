/*
   Xpress Insight vdlx-datagrid
   =============================

   file vdlx-datagrid/ko-utils.js
   ```````````````````````
   vdlx-datagrid knockout utils.

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

import isEqual from 'lodash/isEqual';

export const onSubscribe = function(f, observable) {
    var subscribe = observable.subscribe;
    observable.subscribe = function() {
        var subscription = subscribe.apply(observable, arguments);
        f(subscription);
        return subscription;
    };

    return observable;
};

export function onSubscriptionDispose(f, subscription) {
    var dispose = subscription.dispose;

    subscription.dispose = function() {
        dispose.apply(subscription, arguments);
        f();
    };

    return subscription;
}

export const withEqualityComparer = function(f, obs) {
    obs.equalityComparer = f;
    return obs;
};

/**
 * Sets equalityComparer on the observable
 */

export const withDeepEquals = obs => withEqualityComparer(isEqual, obs);

export const createMutationObservable = (
    /** @type {HTMLElement} */ elm,
    /** @type {MutationObserverInit} */ config = { attributes: true, childList: true, subtree: true }
) => {
    const tempObservable = ko.observable();

    const observer = new MutationObserver((mutationsList, observer) => {
        tempObservable(mutationsList);
    });

    const res = ko.pureComputed(() => tempObservable());

    const awakeSubscription = res.subscribe(() => observer.observe(elm, config), res, 'awake');

    const asleepSubscription = res.subscribe(() => observer.disconnect(), res, 'asleep');

    return res;
};

export const withDeferred = obs => obs.extend({ deferred: true });
