import {
    convertArrayOfArraysData,
    convertPrimitiveArray,
    getRowDataType
} from '../../../../src/js/vdlx-datagrid/custom-data/custom-data-utils';
import {ROW_DATA_TYPES} from "../../../../src/js/constants";

describe('custom data utils', () => {

    describe('getRowDataType', () => {

        describe('getRowDataType', () => {
            it('returns object', () => {
                expect(getRowDataType({one: 23})).toEqual(ROW_DATA_TYPES.object);
            });
            it('returns array', () => {
                expect(getRowDataType([1, 2, 3])).toEqual(ROW_DATA_TYPES.array);
            });
            it('returns primitive', () => {
                expect(getRowDataType(123)).toEqual(ROW_DATA_TYPES.primitive);
            });
            it('returns function', () => {
                const aFunc = () => 666;
                expect(getRowDataType(aFunc)).toEqual(ROW_DATA_TYPES.function);
            });
        });

    });

    describe('convertArrayOfArraysData', () => {
        it('converts data', () => {
            const data = [['a', 1], ['b', 2]];
            expect(convertArrayOfArraysData(data)).toEqual([
                {'column 0': 'a', 'column 1': 1},
                {'column 0': 'b', 'column 1': 2}
            ]);
        });
    });

    describe('convertPrimitiveArray', () => {
        it('converts data', () => {
            const data = [1, 2, 3];
            expect(convertPrimitiveArray(data)).toEqual([
                {'column 0': 1},
                {'column 0': 2},
                {'column 0': 3}
            ]);
        });
    });
});
