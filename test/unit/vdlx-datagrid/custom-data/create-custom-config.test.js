import {
    applyRowFilter,
    configureColumnFilter,
    convertCustomData,
    createAutoColumnDefinitions,
    createColumnDefinition,
    createCustomConfig
} from '../../../../src/js/vdlx-datagrid/custom-data/create-custom-config';

describe('createCustomConfig', () => {

    describe(' default createCustomConfig', () => {

        let gridOptions;
        beforeEach(() => {
            gridOptions = {
                data: () => [1, 2, 3, 4]
            };
        });

        it('creates config object containing column definitions and table data', () => {

            expect(createCustomConfig(gridOptions)).toEqual(
                {
                    columns: [{
                        cssClass: 'numeric',
                        editor: 'input',
                        elementType: 'INTEGER',
                        field: 'column 0',
                        frozen: false,
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
            gridOptions.columnFilter = true;
            expect(createCustomConfig(gridOptions)).toEqual(
                {
                    columns: [{
                        cssClass: 'numeric',
                        editor: 'input',
                        elementType: 'INTEGER',
                        field: 'column 0',
                        frozen: false,
                        id: 'column 0',
                        sorter: 'number',
                        title: 'column 0',
                        headerFilter: true,
                        headerFilterFunc: expect.any(Function),
                        headerFilterParams: undefined,
                        headerFilterPlaceholder: 'No Filter'
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

    describe('convertCustomData', () => {

        it('converts array of arrays', () => {
            const data = [
                [1, 2],
                [3, 4]
            ];

            expect(convertCustomData(data)).toEqual([
                {'column 0': 1, 'column 1': 2},
                {'column 0': 3, 'column 1': 4}
            ]);
        });

        it('converts array of primitives', () => {

            expect(convertCustomData([1, 2, 3, 4])).toEqual([
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
            expect(convertCustomData(data)).toEqual(data);
        });

        it('logs error and returns empty when javascript function discovered', () => {
            const data = [
                () => 666,
                () => 666
            ];

            const result = convertCustomData(data);
            expect(result).toEqual([]);
            expect(global.console.error).toBeCalledWith(
                expect.stringContaining('Error for component vdlx-datagrid: Please remove functions from the data.')
            );
        });

    });

    describe('applyRowFilter', () => {

        let tableData;
        beforeEach(() => {
            tableData = [
                {'column 0': 0, 'column 1': 101},
                {'column 0': 10, 'column 1': 102},
                {'column 0': 20, 'column 1': 103}
            ];
        });

        it('feeds data row by row thru the rowFilter', () => {
            const rowFilter = jest.fn();
            applyRowFilter(tableData, rowFilter);
            expect(rowFilter).toHaveBeenCalledTimes(3);
        });

        it('filters data', () => {
            const rowFilter = (rowData) => rowData[0] > 10;
            expect(applyRowFilter(tableData, rowFilter)).toEqual([{'column 0': 20, 'column 1': 103}]);
        });
    });

    describe('createAutoColumnDefinitions', () => {

        it('returns singular column config', () => {
            expect(createAutoColumnDefinitions(1)).toEqual(expect.any(Object));
        });

        it('returns arrays of column configs', () => {
            expect(createAutoColumnDefinitions([1, 2])).toEqual([expect.any(Object), expect.any(Object)]);
        });

        it('returns empty column config when no data', () => {
            expect(createAutoColumnDefinitions([])).toEqual([]);
        });

        it('converts data into column definitions', () => {

            const data = {value: 100, label: 'label', isTrue: true};
            expect(createAutoColumnDefinitions(data)).toEqual([
                {
                    cssClass: 'numeric',
                    editor: 'input',
                    elementType: 'INTEGER',
                    field: 'value',
                    frozen: false,
                    id: 'value',
                    sorter: 'number',
                    title: 'value'
                },
                {
                    editor: 'input',
                    elementType: 'STRING',
                    field: 'label',
                    frozen: false,
                    id: 'label',
                    sorter: 'string',
                    title: 'label'
                },
                {
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    field: 'isTrue',
                    frozen: false,
                    formatter: expect.any(Function),
                    id: 'isTrue',
                    sorter: 'boolean',
                    title: 'isTrue'
                }
            ]);
        });


        it('adds freeze attr', () => {

            const data = {value: 100, label: 'label', isTrue: true};
            expect(createAutoColumnDefinitions(data, false, 2)).toEqual([
                {
                    cssClass: 'numeric',
                    editor: 'input',
                    elementType: 'INTEGER',
                    field: 'value',
                    frozen: true,
                    id: 'value',
                    sorter: 'number',
                    title: 'value'
                },
                {
                    editor: 'input',
                    elementType: 'STRING',
                    field: 'label',
                    frozen: true,
                    id: 'label',
                    sorter: 'string',
                    title: 'label'
                },
                {
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    field: 'isTrue',
                    frozen: false,
                    formatter: expect.any(Function),
                    id: 'isTrue',
                    sorter: 'boolean',
                    title: 'isTrue'
                }
            ]);
        });

    });

    describe('createColumnDefinition', () => {

        it('creates numeric column config', () => {
            const key = 'colName';
            const val = 123;
            expect(createColumnDefinition(val, key, false, false)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    frozen: false,
                    cssClass: 'numeric',
                    editor: 'input',
                    elementType: 'INTEGER',
                    sorter: 'number'
                }
            );
        });

        it('creates string column config', () => {
            const key = 'colName';
            const val = 'hello';
            expect(createColumnDefinition(val, key, false, false)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    frozen: false,
                    editor: 'input',
                    elementType: 'STRING',
                    sorter: 'string'
                }
            );
        });

        it('creates boolean/checkbox column config', () => {
            const key = 'colName';
            const val = true;
            expect(createColumnDefinition(val, key, false, false)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    frozen: false,
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    sorter: 'boolean',
                    formatter: expect.any(Function)
                }
            );
        });

        it('creates string column with a filter', () => {
            const key = 'colName';
            const val = 'hello';
            expect(createColumnDefinition(val, key, true, false)).toEqual(
                {
                    id: key,
                    field: key,
                    title: key,
                    frozen: false,
                    editor: 'input',
                    elementType: 'STRING',
                    sorter: 'string',
                    headerFilter: true,
                    headerFilterFunc: expect.any(Function),
                    headerFilterParams: undefined,
                    headerFilterPlaceholder: 'No Filter'
                }
            );
        });

    });

    describe('configureColumnFilter', () => {
        it('creates new object with filter props', () => {
            const col = {
                cssClass: 'numeric',
                editor: 'input',
                elementType: 'INTEGER',
                field: 'value',
                id: 'value',
                sorter: 'number',
                title: 'value'
            };

            expect(configureColumnFilter(col)).toEqual(
                {
                    cssClass: 'numeric',
                    editor: 'input',
                    elementType: 'INTEGER',
                    field: 'value',
                    id: 'value',
                    sorter: 'number',
                    title: 'value',
                    headerFilter: true,
                    headerFilterFunc: expect.any(Function),
                    headerFilterParams: undefined,
                    headerFilterPlaceholder: 'No Filter'
                }
            );
        });
    });

});
