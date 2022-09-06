import {
    convertObjectColDefinitions,
    createBasicColumnDefinition,
    createCustomColumnSortOrder,
    createValueTypedColumnProperties,
    isLabelObjectValid,
    isObjectDefinitionColValid,
    overrideCustomColumnAttributes,
    validateLabelsData,
    validateObjectColDefinitions
} from "../../../../src/js/vdlx-datagrid/custom-data/custom-column-utils";
import * as dataUtils from '../../../../src/js/vdlx-datagrid/custom-data/custom-data-utils';

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
        describe('validateObjectColDefinitions', () => {
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
                const rowOne = [['a',1]];
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

        describe('validateLabelsData', () => {
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

    })
});
