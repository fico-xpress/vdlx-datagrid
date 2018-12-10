/** @type {KnockoutStatic} */ ko;

// TODO consider renaming 'ko-utils::map' to 'ko-utils::apply' and reversing the order of parameters to match lodash.
// TODO is the currying necessary? Is it actually used in practice or simply adding complexity?
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
export const combineMap = _.curry((f, ...observables) => {
    return map(f, combineLatest(...observables));
}, 2);

// TODO this isn't filter as it's generally understood
// TODO consider renaming it 'guard' or similar
export const filter = _.curry(function (predicate, observable) {
    var previousValue = ko.unwrap(observable);

    return map(function (val) {
        if (predicate(val)) {
            previousValue = val;
            return val;
        }
        return previousValue;
    }, observable);
}, 2);

export const startWith = _.curry((value, o2) => {
    const res = ko.observable(ko.unwrap(value));

    let anotherSubscription;
    return onSubscribe(subscription => {
        if (!anotherSubscription) {
            anotherSubscription = o2.subscribe(anotherValue => res(anotherValue));
        }

        onSubscriptionDispose(() => {
            if (!!res.getSubscriptionsCount()) {
                anotherSubscription.dispose();
                anotherSubscription = null;
            }
        }, subscription);
    }, res);
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

export const withEqualityComparer = _.curry(function (f, obs) {
    obs.equalityComparer = f;
    return obs;
}, 2);

export const  withDeepEquals = withEqualityComparer(_.isEqual);