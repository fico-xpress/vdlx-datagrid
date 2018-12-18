/** @type {KnockoutStatic} */ ko;
/** @type {import('lodash').LoDashStatic} */ _;

export const onSubscribe = _.curry(function (f, observable) {
    var subscribe = observable.subscribe;
    observable.subscribe = function () {
        var subscription = subscribe.apply(observable, arguments);
        f(subscription);
        return subscription;
    };

    return observable;
}, 2);

export function onSubscriptionDispose (f, subscription) {
    var dispose = subscription.dispose;

    subscription.dispose = function () {
        dispose.apply(subscription, arguments);
        f();
    };

    return subscription;
}

export const withEqualityComparer = _.curry(function (f, obs) {
    obs.equalityComparer = f;
    return obs;
}, 2);

/**
 * Sets equalityComparer on the observable
 */

export const withDeepEquals = withEqualityComparer(_.isEqual);