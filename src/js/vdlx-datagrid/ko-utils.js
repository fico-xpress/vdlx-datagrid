/** @type {KnockoutStatic} */ ko;

export const map = _.curry(function (f, observable) {
    return ko.pureComputed(function () {
        return f(ko.unwrap(observable));
    });
}, 2);

export const combineLatest = function (observables) {
    return ko.pureComputed(function () {
        return _.map([].concat(observables), function (observable) {
            return ko.unwrap(observable);
        });
    });
};

/**
 * @param {Function} f
 * @param {...KnockoutObservable} observables
 * @returns {KnockoutObservable}
*/
export const combineAndMap = _.curry((f, ...observables) => {
    return map(f, combineLatest(...observables));
}, 2);

export const filter = _.curry(function (predicate, observable) {
    var previousValue;

    return map(function (val) {
        if (predicate(val)) {
            previousValue = val;
            return val;
        }
        return previousValue;
    }, observable);
}, 2);

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