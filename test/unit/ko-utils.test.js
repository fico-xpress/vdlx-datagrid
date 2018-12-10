import {onSubscribe} from '../../src/js/vdlx-datagrid/ko-utils';

describe('ko-utils::onSubscribe', () => {

    test('onSubscribe notifies when ', done => {

        const START_VALUE = 3;
        const OBSERVABLE = ko.observable(START_VALUE);

        let doIt = callback => {
            done();
        };

        let thing = onSubscribe(doIt, OBSERVABLE);

        OBSERVABLE.subscribe(v => {
            // nothing needed here
        });

    });

});