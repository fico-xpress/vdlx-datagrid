import {insight} from "../../../src/js/insight-globals";
import {TESTING_ONLY} from '../../../src/js/vdlx-datagrid/grid-filters';
import {Enums} from '../../../src/js/vdlx-datagrid/grid-filters';

describe('grid filters functions', () => {
    let exactCompareAsNumber = TESTING_ONLY._exactCompareAsNumber;
    let exactCompareAsNumberRounded = TESTING_ONLY._exactCompareAsNumberRounded;

    beforeEach(() => {

        insight.Formatter = {
            format: {
                integer: '#,##0',
                decimal: '#,##0.0###'
            }
        };

    });

    describe('tests exact number comparison', () => {

        let numbers = [
            [2.1, 2.1],
            ['2.3', 2.3],
            [4.758, '4.758'],
            ['9999.1234', '9999.1234'],
            ['1.123456788', 1.123456788],
            ['-1.123456788', -1.123456788]
        ];
        numbers.forEach(([searchData, cellData]) => {
            it(`${searchData} exactly matches ${cellData}`, () => {
                expect(exactCompareAsNumber(searchData, cellData)).toBeTruthy();
            })
        });

    });

    describe('test exact rounded number comparison', () => {

        let numbers = [
            [1.58, 1.58, {format: '#0.##'}],
            [1.6, 1.58, {format: '##.#'}],
            [1.5, 1.49, {elementType: Enums.DataType.REAL}]
        ];
        numbers.forEach(([searchData, cellData, column]) => {
            it(`${searchData} matches ${cellData} when formatted`, () => {
                let result = exactCompareAsNumberRounded(searchData, cellData, column);
                expect(result)
                    .toBeTruthy();
            });
        })

    });

});
