import {
    convertArrayOfArraysData,
    convertCustomDataToObjectData,
    convertLabels,
    convertObjectDataToLabelData,
    convertPrimitiveArray,
    convertPrimitiveArraysToLabelArrays,
    convertPrimitiveArrayToLabelArray,
    createLabelObject,
    createLabelsConfig,
    getDataType,
    getRowDataType
} from '../../../../src/js/datagrid/custom-data/custom-data-utils';
import {ROW_DATA_TYPES} from "../../../../src/js/constants";
import {Enums} from "../../../../src/js/datagrid/grid-filters";

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

    // describe('convertPrimitiveArraysToLabelArrays', () => {
    //     it('converts data', () => {
    //         convertPrimitiveArraysToLabelArrays()
    //     });
    // });

    // describe('convertPrimitiveArrayToLabelArray', () => {
    //
    //     it('primitive numbers to label data format', () => {
    //         expect(convertPrimitiveArrayToLabelArray([1,2,3])).toEqual([
    //             {value: 0, label: '1'},
    //             {value: 1, label: '2'},
    //             {value: 2, label: '3'}
    //         ]);
    //     });
    //     it('primitive strings to label data format', () => {
    //         expect(convertPrimitiveArrayToLabelArray(['a', 'b', 'c'])).toEqual([
    //             {value: 0, label: 'a'},
    //             {value: 1, label: 'b'},
    //             {value: 2, label: 'c'}
    //         ]);
    //     });
    //     it('if passed an array of objects, returns passed array', () => {
    //         const myArr = [
    //             { a: 'a'},
    //             { b: 'b'}
    //         ];
    //         expect(convertPrimitiveArrayToLabelArray(myArr)).toEqual(myArr);
    //     });
    // });

    describe('creating labels', () => {
        let array1;
        let array2;
        let labelArray1;
        let labelArray2;

        beforeEach(() => {

            array1 = ['one', 'two', 'three'];
            array2 = ['label one', 'label two', 'label three'];

            labelArray1 = [
                {value: 1, label: 'label 1'},
                {value: 2, label: 'label 2'},
                {value: 3, label: 'label 3'},
            ];
            labelArray2 = [
                {value: 1, label: '2 label 1'},
                {value: 2, label: '2 label 2'},
                {value: 3, label: '2 label 3'},
            ];


        });

        describe('createLabelsConfig', () => {


            it('reduces arrays of label array to an object', () => {
                expect(createLabelsConfig([labelArray1], [labelArray2], [0], [1])).toEqual({
                    '0': {
                        '1': 'label 1',
                        '2': 'label 2',
                        '3': 'label 3'
                    },
                    '1': {
                        '1': '2 label 1',
                        '2': '2 label 2',
                        '3': '2 label 3'
                    }
                });
            });
            it('reduces arrays of primitives array to an object', () => {
                expect(createLabelsConfig([array1], [array2], [0], [1])).toEqual({
                    '0': {
                        '0': 'one',
                        '1': 'two',
                        '2': 'three'
                    },
                    '1': {
                        '0': 'label one',
                        '1': 'label two',
                        '2': 'label three'
                    }
                });
            });
            it('reduces arrays of primitives and label arrays to an object', () => {
                expect(createLabelsConfig([array1, labelArray1], [array2, labelArray2], [0, 1], [2, 3])).toEqual({
                    '0': {
                        '0': 'one',
                        '1': 'two',
                        '2': 'three'
                    },
                    '1': {
                        '1': 'label 1',
                        '2': 'label 2',
                        '3': 'label 3'
                    },
                    '2': {
                        '0': 'label one',
                        '1': 'label two',
                        '2': 'label three'
                    },
                    '3': {
                        '1': '2 label 1',
                        '2': '2 label 2',
                        '3': '2 label 3'
                    }
                });
            });

            it('returns empty objects for dimensions', () => {
                expect(createLabelsConfig([], [], [], [])).toEqual({});
            });

            // it('ignores undefined rows', () => {
            //     expect(createLabelsConfig(undefined, [])).toEqual({
            //         '0': {}
            //     });
            // });
            // it('ignores undefined columns', () => {
            //     expect(createLabelsConfig([], undefined)).toEqual({
            //         '0': {}
            //     });
            // });
            // it('handles undefined', () => {
            //     expect(createLabelsConfig(undefined, undefined)).toEqual({});
            // });

        });

        describe('convertLabels', () => {
            it('converts primitive array', () => {
                expect(convertLabels(array1)).toEqual({
                    '0': 'one',
                    '1': 'two',
                    '2': 'three'
                });
            });
            it('converts label array', () => {
                expect(convertLabels(labelArray1)).toEqual({
                    '1': 'label 1',
                    '2': 'label 2',
                    '3': 'label 3'
                });
            });
        });

        describe('createLabelObject', () => {
            it('creates label object keyed with start and indexes', () => {
                expect(createLabelObject(10, [0,1], [array1, labelArray1])).toEqual({
                    '10': {
                        '0': 'one',
                        '1': 'two',
                        '2': 'three'
                    },
                    '11': {
                        '1': 'label 1',
                        '2': 'label 2',
                        '3': 'label 3'
                    }
                });
            });
            it('creates empty objects for dimensions without labels', () => {
                expect(createLabelObject(3, [0,1], [array1])).toEqual({
                    '3': {
                        '0': 'one',
                        '1': 'two',
                        '2': 'three'
                    },
                    '4': {}
                });
            });

        });

    });
});
