/** @type {KnockoutStatic} */ ko;

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