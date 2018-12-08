import {map, combineLatest, combineMap, filter} from '../../src/js/vdlx-datagrid/ko-utils';

// example function
const SQUARE = x => x * x;

describe('ko-utils::map', () => {

    test('takes an observable, runs the supplied function over its value then returns the resulting value in a new observable, thus allowing the resulting observable to react to changes.', () => {

        const INPUT = -9;
        const INPUT_OBS = ko.observable(0);

        let mapped = map(SQUARE, INPUT_OBS);

        // change the value after
        INPUT_OBS(INPUT);

        expect(mapped()).toBe(81);

    });

    test('is can also accept parameters sequentially, is this useful?', ()=> {

        const INPUT = -9;
        const INPUT_OBS = ko.observable(0);

        // supply the function
        let temp = map(SQUARE);

        // supply the observable
        let mapped = temp(INPUT_OBS);

        // change the value after
        INPUT_OBS(INPUT);

        expect(mapped()).toBe(81);

    })
});

describe('ko-utils::combineLatest', () => {

    test('creates an observable list of observables which, when queried, returns the values of each', () => {

        const INPUT_1 = ko.observable(1);
        const INPUT_2 = ko.observable(2);
        const INPUT_3 = ko.observable(3);

        const OBS1 = map(SQUARE, INPUT_1);
        const OBS2 = map(SQUARE, INPUT_2);
        const OBS3 = map(SQUARE, INPUT_3);

        const OBSERVABLES = [OBS1,OBS2,OBS3];
        let combined = combineLatest(OBSERVABLES);

        // change the value of one of the observables.
        INPUT_2(4);

        expect(combined()).toEqual([1,16,9]);
    })

});

describe('ko-utils::combineMap', ()=> {

    test('applies a function to an array of observable values. If one of the observable values changes the function is re-evaluated with the new values.', ()=> {

        const OBSERVABLES = _.map([1,2,3], v => ko.observable(v));

        let result = combineMap(_.max, OBSERVABLES);

        OBSERVABLES[1](99);

        expect(result()).toEqual(99);
    });

    test('also allows subscription to the result', done => {

        const OBSERVABLES = _.map([1,2,3], v => ko.observable(v));

        let result = combineMap(_.sum, OBSERVABLES);

        result.subscribe(v => {
            expect(v).toEqual(1 + 101 + 3);
            done();
        });

        // make the change later
        _.delay(()=> {
            OBSERVABLES[1](101);
        }, 10);

    });
});

describe('ko-utils::filter', ()=> {

    test('guards an observable with a predicate function', () => {

        const START_VALUE = 1;
        const UPDATE_VALUE = 45;

        const OBSERVABLE = ko.observable(START_VALUE);

        let greaterThanFive = filter(x => x > 50, OBSERVABLE);

        OBSERVABLE(UPDATE_VALUE);
        expect(greaterThanFive()).toEqual(START_VALUE);
    });

    test('passes the value of an observable with a predicate function', () => {
        const START_VALUE = 1;
        const UPDATE_VALUE = 55;

        const OBSERVABLE = ko.observable(START_VALUE);

        let greaterThanFive = filter(x => x > 50, OBSERVABLE);

        OBSERVABLE(UPDATE_VALUE);
        expect(greaterThanFive()).toEqual(UPDATE_VALUE);
    });

});