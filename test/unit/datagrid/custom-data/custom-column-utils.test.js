import {
    calculatePivotDisplayCalcs,
    convertObjectColDefinitions, validateDimensions,
    createBasicColumnDefinition,
    createCustomColumnSortOrder,
    createValueTypedColumnProperties, extractLabels,
    isLabelObjectValid,
    isObjectDefinitionColValid,
    overrideCustomColumnAttributes, pivotColumnSizeToIndex, pivotRowSizeToIndex,
    validateLabelsData,
    validateObjectColDefinitions, validatePivotRowsAndColumns
} from "../../../../src/js/datagrid/custom-data/custom-column-utils";
import * as dataUtils from '../../../../src/js/datagrid/custom-data/custom-data-utils';

import {pivotDataModule} from "../../../../src/js/datagrid/custom-data/custom-data-pivot";

describe('custom column utils', () => {

    describe('createValueTypedColumnProperties', () => {

        it('returns checkbox props', () => {
            expect(createValueTypedColumnProperties(true)).toEqual({
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    formatter: expect.any(Function),
                    sorter: 'boolean'
                }
            );
        });

        it('boolean properties have a formatter that can create a checked checkbox', () => {
            const cell = {
                getValue: () => true
            }
            const props = createValueTypedColumnProperties(true);
            expect(props.formatter(cell)).toEqual('<div class="checkbox-editor"><input type="checkbox" checked disabled/></div>');
        });

        it('boolean properties have a formatter that can create an unchecked checkbox', () => {
            const cell = {
                getValue: () => false
            }
            const props = createValueTypedColumnProperties(true);
            expect(props.formatter(cell)).toEqual('<div class="checkbox-editor"><input type="checkbox"  disabled/></div>');
        });

        it('returns numeric props', () => {
            expect(createValueTypedColumnProperties(123)).toEqual({
                    editor: 'input',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    sorter: 'number'
                }
            );
        });
        it('returns string props', () => {
            expect(createValueTypedColumnProperties('abc')).toEqual({
                    editor: 'input',
                    elementType: 'STRING',
                    sorter: 'string'
                }
            );
        });
        describe('error handling', () => {

            beforeEach(() => {
                jest.spyOn(dataUtils, 'getDataType').mockReturnValue('unsupported');
            })

            it('console error for unknown ', () => {
                createValueTypedColumnProperties(() => true);
                expect(global.console.error).toBeCalledWith(
                    expect.stringContaining('unrecognised data type')
                );

            });

            afterEach(() => {
                dataUtils.getDataType.mockRestore();
            });

        })
    });

    describe('createBasicColumnDefinition', () => {

        it('returns checkbox column', () => {
            expect(createBasicColumnDefinition('key', true)).toEqual({
                    editable: false,
                    id: 'key',
                    field: 'key',
                    title: 'key',
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    formatter: expect.any(Function),
                    sorter: 'boolean'
                }
            );
        });
        it('returns numeric column', () => {
            expect(createBasicColumnDefinition('key', 123)).toEqual({
                    editable: false,
                    id: 'key',
                    field: 'key',
                    title: 'key',
                    editor: 'input',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    sorter: 'number'
                }
            );
        });
        it('returns string column', () => {
            expect(createBasicColumnDefinition('key', 'abc')).toEqual({
                    editable: false,
                    id: 'key',
                    field: 'key',
                    title: 'key',
                    editor: 'input',
                    elementType: 'STRING',
                    sorter: 'string'
                }
            );
        });
    });

    describe('validation', () => {

        describe('isUserColumnValid', () => {
            it('returns true for valid column', () => {
                expect(isObjectDefinitionColValid({field: 'f1'})).toEqual(true);
            });
            it('false when field attr missing', () => {
                expect(isObjectDefinitionColValid({missing: 'f1'})).toEqual(false);
            });
            it('false when field attr empty', () => {
                expect(isObjectDefinitionColValid({field: ''})).toEqual(false);
            });
            it('false when field attr undefined', () => {
                expect(isObjectDefinitionColValid({field: undefined})).toEqual(false);
            });
        });
        describe.skip('validateObjectColDefinitions', () => {
            it('returns true for single valid column', () => {
                const colDefinitions = [{field: 'f1'}];
                const rowOne = {'f1': 1};
                expect(validateObjectColDefinitions(colDefinitions, rowOne)).toEqual(true);
            });
            it('returns true for valid columns', () => {
                const colDefinitions = [{field: 'f1'}, {field: 'f2'}];
                const rowOne = {'f1': 1};
                expect(validateObjectColDefinitions(colDefinitions, rowOne)).toEqual(true);
            });
            it('throws error when field attr missing', () => {
                expect(() => {
                    const rowOne = {'f1': 1};
                    validateObjectColDefinitions([{missing: 'f1'}, {field: 'f2'}], rowOne);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, the field attribute is missing or empty.');
            });
            it('throws error when field attr empty', () => {
                const rowOne = {'f1': 1};
                expect(() => {
                    validateObjectColDefinitions([{field: ''}, {field: 'f2'}], rowOne);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, the field attribute is missing or empty.');
            });
            it('throws error when passed primitive data', () => {
                const rowOne = 1;
                expect(() => {
                    validateObjectColDefinitions([{field: ''}, {field: 'f2'}], rowOne);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, data incompatible with column definition.');
            });
            it('throws error when passed array of arrays', () => {
                const rowOne = [['a', 1]];
                expect(() => {
                    validateObjectColDefinitions([{field: ''}, {field: 'f2'}], rowOne);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, data incompatible with column definition.');
            });
            it('throws error when passed col config and data that does not match', () => {
                const rowOne = {'xyz': 1};
                expect(() => {
                    validateObjectColDefinitions([{field: 'f2'}], rowOne);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, no matching field attributes in the data.');
            });
        });

        describe('isLabelObjectValid', () => {
            it('returns true for single valid column', () => {
                expect(isLabelObjectValid({key: '1', value: 123, label: 'one'})).toEqual(true);
            });
            it('returns false when label attr missing', () => {
                expect(isLabelObjectValid({key: '1', value: 123, missing: 'one'})).toEqual(false);
            });
            it('returns false when value attr missing', () => {
                expect(isLabelObjectValid({key: '1', missing: 123, label: 'one'})).toEqual(false);
            });
            it('returns false when value undefined', () => {
                expect(isLabelObjectValid({key: '1', value: undefined, label: 'one'})).toEqual(false);
            });
        });

        // todo this is skipped
        describe.skip('validateLabelsData', () => {
            it('returns true for single valid column', () => {
                expect(validateLabelsData([{key: '1', value: 123, label: 'one'}])).toEqual(true);
            });
            it('returns true for multiple valid columns', () => {
                expect(validateLabelsData([{key: '1', value: 123, label: 'one'}, {
                    key: '2',
                    value: 456,
                    label: 'two'
                }])).toEqual(true);
            });
            it('throws error when value attr missing', () => {
                expect(() => {
                    validateLabelsData([{key: '1', missing: 123, label: 'one'}]);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, the value and/or label attribute is missing or empty.');
            });
            it('throws error when label attr missing', () => {
                expect(() => {
                    validateLabelsData([{key: '1', value: 123, missing: 'one'}]);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, the value and/or label attribute is missing or empty.');
            });
            it('throws error when value undefined', () => {
                expect(() => {
                    validateLabelsData([{key: '1', value: undefined, label: 'one'}]);
                }).toThrow('Error for component vdlx-datagrid: Invalid column definition, the value and/or label attribute is missing or empty.');
            });
        });
    });

    describe('convertObjectColDefinitions', () => {

        let data;

        beforeEach(() => {
            data = [
                {a: 123, b: 456},
            ];
        })

        it('adds basic column fields to object column definition', () => {
            const defintions = [
                {field: 'a', title: 'ay', thing: 'thing'},
                {field: 'b', title: 'bee', myAttr: 'value'}
            ];

            expect(convertObjectColDefinitions(defintions, data)).toEqual([
                {
                    field: 'a',
                    title: 'ay',
                    editable: false,
                    id: 'a',
                    editor: 'input',
                    sorter: 'number',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    thing: 'thing'
                },
                {
                    field: 'b',
                    title: 'bee',
                    editable: false,
                    id: 'b',
                    editor: 'input',
                    sorter: 'number',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    myAttr: 'value'
                }
            ]);
        });
        it('overwrites editable attr', () => {
            const defintions = [
                {field: 'a', title: 'ay', thing: 'thing', editable: true},
                {field: 'b', title: 'bee', myAttr: 'value', editable: true}
            ];

            expect(convertObjectColDefinitions(defintions, data)).toEqual([
                {
                    field: 'a',
                    title: 'ay',
                    editable: false,
                    id: 'a',
                    editor: 'input',
                    sorter: 'number',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    thing: 'thing'
                },
                {
                    field: 'b',
                    title: 'bee',
                    editable: false,
                    id: 'b',
                    editor: 'input',
                    sorter: 'number',
                    elementType: 'INTEGER',
                    cssClass: 'numeric',
                    myAttr: 'value'
                }
            ]);
        });
    });

    describe('overrideCustomColumnAttributes', () => {
        it('overwrites editable when true', () => {
            expect(overrideCustomColumnAttributes([{a: 'a', editable: true}])).toEqual([{a: 'a', editable: false}]);
        });
        it('overwrites editable when present', () => {
            expect(overrideCustomColumnAttributes([{a: 'a', editable: 'hello'}])).toEqual([{a: 'a', editable: false}]);
        });
        it('dones not add editable when not present', () => {
            expect(overrideCustomColumnAttributes([{a: 'a'}])).toEqual([{a: 'a'}]);
        });
    })

    describe('createCustomColumnSortOrder', () => {

        it('returns empty array when no column definitions', () => {
            expect(createCustomColumnSortOrder([])).toEqual([]);
        });

        it('orders by the first visible column if no specific ordering specified', () => {

            const colDefs = [{
                field: 'hidden',
                visible: false
            }, {
                field: 'sortByMe'
            }];

            expect(createCustomColumnSortOrder(colDefs)).toEqual([{column: 'sortByMe', dir: 'asc'}]);
        });

        it('orders by the headerSortStartingDir attribute', () => {

            const colDefs = [
                {
                    field: 'hidden',
                    visible: false,
                    headerSortStartingDir: 'desc'
                },
                {
                    field: 'sortByMe',
                    headerSortStartingDir: 'desc'
                }];

            expect(createCustomColumnSortOrder(colDefs)).toEqual([{column: 'sortByMe', dir: 'desc'}]);
        });

        it('orders by multiple columns that have headerSortStartingDir attribute', () => {

            const colDefs = [
                {
                    field: 'hidden',
                    visible: false,
                    headerSortStartingDir: 'desc'
                },
                {
                    field: 'sortByMe',
                    headerSortStartingDir: 'desc'
                },
                {
                    field: 'hidden2',
                    visible: false,
                    headerSortStartingDir: 'desc'
                },
                {
                    field: 'sortByMe2',
                    headerSortStartingDir: 'asc'
                }];

            expect(createCustomColumnSortOrder(colDefs)).toEqual([
                {column: 'sortByMe', dir: 'desc'},
                {column: 'sortByMe2', dir: 'asc'},
            ]);
        });

    });

    describe('pivot column functions', () => {
        describe('pivotRowSizeToIndex', () => {
            it('pivotRowSizeToIndex positive number', () => {
                expect(pivotRowSizeToIndex(3)).toEqual([0, 1, 2]);
            });

            it('pivotRowSizeToIndex negative', () => {
                expect(pivotRowSizeToIndex(-3)).toEqual([]);
            });
        });

        describe('pivotColumnSizeToIndex', () => {
            it('calculate position of single column', () => {
                expect(pivotColumnSizeToIndex(3, 2, 1)).toEqual([2]);
            });

            it('calculate positions of 2 columns', () => {
                expect(pivotColumnSizeToIndex(3, 1, 2)).toEqual([1, 2]);
            });

            it('calculate positions of 2 columns when total size exceedes row and column count', () => {
                expect(pivotColumnSizeToIndex(10, 1, 2)).toEqual([1, 2]);
            });

            it('returns empty when no column count passed', () => {
                expect(pivotColumnSizeToIndex(10, 1, 0)).toEqual([]);
            });

        });
        describe('validatePivotRowsAndColumns', () => {
            it('calculate position of single column', () => {
                expect(validatePivotRowsAndColumns(3, 2, 5)).toEqual(true);
            });
            it('ignores duplicate vals', () => {
                expect(validatePivotRowsAndColumns([0,1,2], [0,1,2], 5)).toEqual(true);
            });
            it('throws error when col and row count exceeds size', () => {
                expect(() => {
                    expect(validatePivotRowsAndColumns([0, 1, 2, 3, 4], [5, 6, 7, 8, 9], 2)).toEqual(true);
                }).toThrow('Error for component vdlx-pivotgrid: The sum of row and column sizes 10, exceeds the dimensionality of the data 2');
            });
            it('throws error when row value exceeds size', () => {
                expect(() => {
                    expect(validatePivotRowsAndColumns([10], [0,2,3], 5)).toEqual(true);
                }).toThrow('Error for component vdlx-pivotgrid: The row or column position 10 must not exceed the dimensionality of the data 5');
            });
            it('throws error when colum value exceeds size', () => {
                expect(() => {
                    expect(validatePivotRowsAndColumns([0,1,2], [10], 5)).toEqual(true);
                }).toThrow('Error for component vdlx-pivotgrid: The row or column position 10 must not exceed the dimensionality of the data 5');
            });
        });

        describe('calculatePivotDisplayCalcs', () => {
            it('rows and columns = all', () => {
                expect(calculatePivotDisplayCalcs(true, true)).toEqual(pivotDataModule.OptionEnums.EnableTotals.All);
            });
            it('rows and no columns = all', () => {
                expect(calculatePivotDisplayCalcs(true, false)).toEqual(pivotDataModule.OptionEnums.EnableTotals.Rows);
            });
            it('no rows and columns = all', () => {
                expect(calculatePivotDisplayCalcs(false, true)).toEqual(pivotDataModule.OptionEnums.EnableTotals.Cols);
            });
            it('no rows and no columns = all', () => {
                expect(calculatePivotDisplayCalcs(false, false)).toEqual(pivotDataModule.OptionEnums.EnableTotals.None);
            });
            it('return all as a default value', () => {
                expect(calculatePivotDisplayCalcs()).toEqual(pivotDataModule.OptionEnums.EnableTotals.None);
            });
        });

        describe('countDimensions', () => {
            it('array of numbers', () => {
                expect(validateDimensions([1, 2], 'row')).toEqual([1, 2]);
            });
            it('array of strings', () => {
                expect(validateDimensions(['1', '2'], 'row')).toEqual(['1', '2']);
            });
            it('returns number', () => {
                expect(validateDimensions(2, 'row')).toEqual(2);
            });
            it('throws error', () => {
                const val = 'invalid value';
                const dimensionName = 'row';
                expect(() => {
                    expect(validateDimensions(val, dimensionName)).toEqual(true);
                }).toThrow(`Error for component vdlx-pivotgrid: Invalid ${dimensionName}-dimensions.  Supported format: An array of ${dimensionName} group headings [headingOne, headingTwo], or a number representing the required amount of ${dimensionName}s.`);
            });
        });

        describe('extractLabels', () => {
            it('array of strings', () => {
                expect(extractLabels(['one', 'two'])).toEqual(['one', 'two']);
            });
            it('single string', () => {
                expect(extractLabels('label')).toEqual(['label']);
            });
            it('number', () => {
                expect(extractLabels(123)).toEqual(['123']);
            });
        });


    });

});
