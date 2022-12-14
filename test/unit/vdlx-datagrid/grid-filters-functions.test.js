import { TESTING_ONLY } from '../../../src/js/datagrid/grid-filters';
import { insightGetter } from '../../../src/js/insight-modules';

describe('grid filters functions', () => {
    let exactCompareAsNumber = TESTING_ONLY._exactCompareAsNumber;
    let filterFloat = TESTING_ONLY._filterFloat;

    beforeEach(() => {
        insightGetter().Formatter = {
            format: {
                integer: '#,##0',
                decimal: '#,##0.0###',
            },
        };
    });

    describe('filter float testing as NaN', () => {
        ['rrr', '12A', '1,000'].forEach((input) => {
            it(`${input} is NaN`, () => {
                let result = filterFloat(input);
                expect(result).toBeNaN();
            });
        });
    });

    describe('filter float testing as valid', () => {
        [
            ['0', 0],
            ['12', 12],
            ['1.0', 1.0],
            ['-1.0', -1.0],
        ].forEach(([input, expected]) => {
            it(`${input} is valid`, () => {
                let result = filterFloat(input);
                expect(result).toBe(expected);
            });
        });
    });

    describe('tests exact number comparison', () => {
        let numbers = [
            [2.1, 2.1],
            ['2.3', 2.3],
            [4.758, '4.758'],
            ['9999.1234', '9999.1234'],
            ['1.123456788', 1.123456788],
            ['-1.123456788', -1.123456788],
        ];
        numbers.forEach(([searchData, cellData]) => {
            it(`${searchData} exactly matches ${cellData}`, () => {
                expect(exactCompareAsNumber(searchData, cellData)).toBeTruthy();
            });
        });
    });
});
