import {
    createCustomConfig,
    getRowDataType,
    convertArrayOfArraysData,
    convertPrimitiveArray,
    createColumnDefinition,
    createAutoColumnDefinitions,
    configureColumnFilter
} from '../../../../src/js/vdlx-datagrid/custom-data/create-custom-config';

describe('createCustomConfig', () => {

    describe('getRowDataType', () => {
        it('returns object', () => {
            expect(getRowDataType({one: 23})).toEqual('object');
        });
        it('returns array', () => {
            expect(getRowDataType([1, 2, 3])).toEqual('array');
        });
        it('returns primitive', () => {
            expect(getRowDataType(123)).toEqual('primitive');
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

    describe('createColumnDefinition', () => {

        it('creates numeric column config', () => {
            const key = 'colName';
            const val = 123;
            expect(createColumnDefinition(val, key)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    cssClass: 'numeric',
                    elementType: 'INTEGER',
                    sorter: 'number'
                }
            );
        });

        it('creates string column config', () => {
            const key = 'colName';
            const val = 'hello';
            expect(createColumnDefinition(val, key)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    elementType: 'STRING',
                    sorter: 'string'
                }
            );
        });

        it('creates boolean/checkbox column config', () => {
            const key = 'colName';
            const val = true;
            expect(createColumnDefinition(val, key)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    elementType: 'BOOLEAN',
                    sorter: 'boolean',
                    formatter: expect.any(Function)
                }
            );
        });

        describe('createAutoColumnDefinitions', () => {
            it('converts data into column definitions', () => {

                const data = {value: 100, label: 'label', isTrue: true};
                expect(createAutoColumnDefinitions(data)).toEqual([
                    {
                        cssClass: 'numeric',
                        elementType: 'INTEGER',
                        field: 'value',
                        id: 'value',
                        sorter: 'number',
                        title: 'value'
                    },
                    {
                        elementType: 'STRING',
                        field: 'label',
                        id: 'label',
                        sorter: 'string',
                        title: 'label'
                    },
                    {
                        elementType: 'BOOLEAN',
                        field: 'isTrue',
                        formatter: expect.any(Function),
                        id: 'isTrue',
                        sorter: 'boolean',
                        title: 'isTrue'
                    }
                ]);
            });
        });

        describe('configureColumnFilter', () => {
            it('creates new object with filter props', () => {
                const col = {
                    cssClass: 'numeric',
                    elementType: 'INTEGER',
                    field: 'value',
                    id: 'value',
                    sorter: 'number',
                    title: 'value'
                };

                expect(configureColumnFilter(col)).toEqual(
                    {
                        cssClass: 'numeric',
                        elementType: 'INTEGER',
                        field: 'value',
                        id: 'value',
                        sorter: 'number',
                        title: 'value',
                        headerFilter: true,
                        headerFilterFunc: expect.any(Function),
                        headerFilterPlaceholder: 'No filter'
                    }
                );
            });
        });

        describe('createCustomConfig', () => {
            it('creates config object containing column definitions and table data', () => {
                const gridOptions = {
                    data: () => [1,2,3,4],
                    columnFilter: false
                };

                expect(createCustomConfig(gridOptions)).toEqual(
                    {
                        columns: [{
                            cssClass: 'numeric',
                            elementType: 'INTEGER',
                            field: 'column 0',
                            id: 'column 0',
                            sorter: 'number',
                            title: 'column 0'
                        }],
                        data: [
                            {'column 0': 1},
                            {'column 0': 2},
                            {'column 0': 3},
                            {'column 0': 4}
                        ]
                    }
                );
            });
        it('creat config containing column filters', () => {
                const gridOptions = {
                    data: () => [1,2,3,4],
                    columnFilter: true
                };

                expect(createCustomConfig(gridOptions)).toEqual(
                    {
                        columns: [{
                            cssClass: 'numeric',
                            elementType: 'INTEGER',
                            field: 'column 0',
                            id: 'column 0',
                            sorter: 'number',
                            title: 'column 0',
                            headerFilter: true,
                            headerFilterFunc: expect.any(Function),
                            headerFilterPlaceholder: 'No filter'
                        }],
                        data: [
                            {'column 0': 1},
                            {'column 0': 2},
                            {'column 0': 3},
                            {'column 0': 4}
                        ]
                    }
                );
            });
        });

    });


});
