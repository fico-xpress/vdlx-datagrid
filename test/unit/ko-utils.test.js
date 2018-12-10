import {onSubscribe} from '../../src/js/vdlx-datagrid/ko-utils';

describe('ko-utils::onSubscribe', () => {

    test('onSubscribe notifies when Knockout subscribes to an observable.', () => {

        const START_VALUE = 3;
        const OBSERVABLE = ko.observable(START_VALUE);

        const doIt = jest.fn();

        const thing = onSubscribe(doIt, OBSERVABLE);

        const subscription = OBSERVABLE.subscribe(_.noop);

        expect(thing).toEqual(OBSERVABLE);
        expect(doIt).toHaveBeenCalledWith(subscription);
    });

});