import {
    convertArrayOfArraysData,
    convertCustomDataToObjectData,
    convertObjectDataToLabelData,
    convertPrimitiveArray,
    getDataType,
    getRowDataType
} from '../../../../src/js/vdlx-datagrid/custom-data/custom-data-utils';
import {ROW_DATA_TYPES} from "../../../../src/js/constants";
import {Enums} from "../../../../src/js/vdlx-datagrid/grid-filters";

describe('custom data utils', () => {

    describe('getDataType', () => {

        it('returns boolean for true', () => {
            expect(getDataType(true)).toEqual(Enums.DataType.BOOLEAN);
        });
        it('returns boolean for false', () => {
            expect(getDataType(false)).toEqual(Enums.DataType.BOOLEAN);
        });
        it('returns string for "true"', () => {
            expect(getDataType('true')).toEqual(Enums.DataType.STRING);
        });
        it('returns integer for a string that can be converted to numeric', () => {
            expect(getDataType('1')).toEqual(Enums.DataType.INTEGER);
        });
        it('returns string', () => {
            expect(getDataType('one')).toEqual(Enums.DataType.STRING);
        });
        it('returns integer for whole number', () => {
            expect(getDataType(1)).toEqual(Enums.DataType.INTEGER);
        });
        it('returns integer for decimal number', () => {
            expect(getDataType(1.9)).toEqual(Enums.DataType.INTEGER);
        });
        it('returns integer for negative number', () => {
            expect(getDataType(-1.9)).toEqual(Enums.DataType.INTEGER);
        });


    });

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

    describe('convertCustomData', () => {

        it('converts array of arrays', () => {
            const data = [
                [1, 2],
                [3, 4]
            ];

            expect(convertCustomDataToObjectData(data)).toEqual([
                {'column 0': 1, 'column 1': 2},
                {'column 0': 3, 'column 1': 4}
            ]);
        });

        it('converts array of primitives', () => {
            expect(convertCustomDataToObjectData([1, 2, 3, 4])).toEqual([
                {'column 0': 1},
                {'column 0': 2},
                {'column 0': 3},
                {'column 0': 4}
            ]);
        });

        it('returns passed data when data is array objects', () => {
            const data = [
                {key: 1, value: 1},
                {key: 2, value: 2}
            ];
            expect(convertCustomDataToObjectData(data)).toEqual(data);
        });

        it('logs error and returns empty when javascript function discovered', () => {
            const data = [
                () => 666,
                () => 666
            ];

            const result = convertCustomDataToObjectData(data);
            expect(result).toEqual([]);
            expect(global.console.error).toBeCalledWith(
                expect.stringContaining('Error for component vdlx-datagrid: Please remove functions from the data.')
            );
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

    describe('convertObjectDataToLabelData', () => {
        it('converts data', () => {
            const data = [
                {
                    key: '1',
                    value: 123,
                    label: 'bottom'
                },
                {
                    key: '2',
                    value: 456,
                    label: 'middle'
                },
                {
                    key: '3',
                    value: 789,
                    label: 'top'
                }
            ];
            expect(convertObjectDataToLabelData(data)).toEqual([{
                    '0': 123,
                    '1': 456,
                    '2': 789
            }]);
        });
    });
});
