import {CUSTOM_COLUMN_DEFINITION} from "../../../../src/js/constants";

import {
    addGridOptionsProps,
    applyRowFilter,
    configureColumnFilter,
    createAutoDefinitionColumns,
    createCustomConfig,
    createLabelData,
    createLabelsDefinitionColumns,
    createObjectDefinitionColumns
} from '../../../../src/js/datagrid/custom-data/create-custom-config';
import * as gridFilters from "../../../../src/js/datagrid/grid-filters";
import * as colUtils from "../../../../src/js/datagrid/custom-data/custom-column-utils";
import {
    convertObjectColDefinitions,
    createBasicColumnDefinition, createPivotIndexes, extractLabels, pivotColumnSizeToIndex,
    validateLabelsData,
    validateObjectColDefinitions, validatePivotRowsAndColumns
} from "../../../../src/js/datagrid/custom-data/custom-column-utils";
import * as dataUtils from '../../../../src/js/datagrid/custom-data/custom-data-utils';

import * as createPivotConfigModule from '../../../../src/js/datagrid/custom-data/create-pivot-config';
import {createLabelsConfig} from "../../../../src/js/datagrid/custom-data/custom-data-utils";

describe('createCustomConfig module', () => {

    describe('createCustomConfig', () => {

        let gridOptions;
        beforeEach(() => {
            gridOptions = {
                columnDefinitionType: CUSTOM_COLUMN_DEFINITION.AUTO,
                columnDefinitions: () => [{column:'definition'}],
                data: () => [1, 2, 3, 4]
            };
        });

        describe('switches different methods for column definition types', () => {

            const resultData = [{data:'data'}];

            let convertCustomDataToObjectDataSpy;
            let convertObjectDataToLabelDataSpy;
            let createBasicColumnDefinitionSpy;
            let validateObjectColDefinitionsSpy;
            let convertObjectColDefinitionsSpy;
            let validateLabelsDataSpy;
            let validatePivotRowsAndColumnsSpy;

            beforeEach(() => {
                convertCustomDataToObjectDataSpy = jest.spyOn(dataUtils, 'convertCustomDataToObjectData').mockReturnValue(resultData);
                convertObjectDataToLabelDataSpy = jest.spyOn(dataUtils, 'convertObjectDataToLabelData').mockReturnValue(resultData);
                createBasicColumnDefinitionSpy = jest.spyOn(colUtils, 'createBasicColumnDefinition').mockReturnValue(resultData);
                validateObjectColDefinitionsSpy = jest.spyOn(colUtils, 'validateObjectColDefinitions').mockReturnValue(resultData);
                convertObjectColDefinitionsSpy = jest.spyOn(colUtils, 'convertObjectColDefinitions').mockReturnValue(resultData);
                validateLabelsDataSpy = jest.spyOn(colUtils, 'validateLabelsData').mockReturnValue(resultData);
                validatePivotRowsAndColumnsSpy = jest.spyOn(colUtils, 'validatePivotRowsAndColumns').mockReturnValue(resultData);
            });

            afterEach(() => {
                dataUtils.convertCustomDataToObjectData.mockRestore();
                dataUtils.convertObjectDataToLabelData.mockRestore();
                colUtils.createBasicColumnDefinition.mockRestore();
                colUtils.validateObjectColDefinitions.mockRestore();
                colUtils.convertObjectColDefinitions.mockRestore();
                colUtils.validateLabelsData.mockRestore();
                colUtils.validatePivotRowsAndColumns.mockRestore();
            });

            it('column definition type: CUSTOM_COLUMN_DEFINITION.AUTO', () => {
                gridOptions.columnDefinitionType = CUSTOM_COLUMN_DEFINITION.AUTO;
                createCustomConfig(gridOptions);
                expect(convertCustomDataToObjectDataSpy).toHaveBeenCalledWith(gridOptions.data());
                expect(createBasicColumnDefinitionSpy).toHaveBeenCalledTimes(1);
                expect(validateLabelsDataSpy).not.toHaveBeenCalled();
                expect(validateObjectColDefinitionsSpy).not.toHaveBeenCalled();
            });

            it('column definition type: CUSTOM_COLUMN_DEFINITION.OBJECT', () => {
                gridOptions.columnDefinitionType = CUSTOM_COLUMN_DEFINITION.OBJECT;
                createCustomConfig(gridOptions);
                expect(validateObjectColDefinitionsSpy).toHaveBeenCalled();
                expect(convertObjectColDefinitionsSpy).toHaveBeenCalledTimes(1);
                expect(convertCustomDataToObjectDataSpy).not.toHaveBeenCalledWith(gridOptions.data());
                expect(validateLabelsDataSpy).not.toHaveBeenCalled();
            });
            it('column definition type: CUSTOM_COLUMN_DEFINITION.LABELS', () => {
                gridOptions.columnDefinitionType = CUSTOM_COLUMN_DEFINITION.LABELS;
                createCustomConfig(gridOptions);
                expect(validateLabelsDataSpy).toHaveBeenCalled();
                expect(convertObjectDataToLabelDataSpy).toHaveBeenCalledTimes(1);
                expect(convertCustomDataToObjectDataSpy).not.toHaveBeenCalledWith(gridOptions.data());
                expect(validateObjectColDefinitionsSpy).not.toHaveBeenCalled();
            });

            it('console error for unknown type', () => {
                gridOptions.columnDefinitionType = 'unsupported';
                expect(() => {
                    createCustomConfig(gridOptions);
                }).toThrow('Error for component vdlx-datagrid: Unrecognised column format.');
                expect(validateLabelsDataSpy).not.toHaveBeenCalled();
                expect(convertCustomDataToObjectDataSpy).not.toHaveBeenCalledWith(gridOptions.data());
                expect(validateObjectColDefinitionsSpy).not.toHaveBeenCalled();
            });
        });


        describe('pivot data column definition', () => {

            const resultData = [{data:'data'}];
            const pivotedData = [{data:'pivotedData'}];

            let validatePivotRowsAndColumnsSpy;
            let createPivotIndexesSpy;
            let pivotColumnSizeToIndexSpy;
            let createPivotDisplayCalcsSpy;
            let extractLabelsSpy;
            let createLabelsConfigSpy;
            let createPivotConfigSpy;

            beforeEach(() => {
                validatePivotRowsAndColumnsSpy = jest.spyOn(colUtils, 'validatePivotRowsAndColumns').mockReturnValue(resultData);
                createPivotIndexesSpy = jest.spyOn(colUtils, 'createPivotIndexes').mockReturnValue(resultData);
                pivotColumnSizeToIndexSpy = jest.spyOn(colUtils, 'pivotColumnSizeToIndex').mockReturnValue(resultData);
                createPivotDisplayCalcsSpy = jest.spyOn(colUtils, 'calculatePivotDisplayCalcs').mockReturnValue('all');
                extractLabelsSpy = jest.spyOn(colUtils, 'extractLabels').mockReturnValue('all');
                createLabelsConfigSpy = jest.spyOn(dataUtils, 'createLabelsConfig').mockReturnValue('all');
                createPivotConfigSpy = jest.spyOn(createPivotConfigModule, 'createPivotConfig').mockReturnValue(pivotedData);
            });

            afterEach(() => {
                colUtils.validatePivotRowsAndColumns.mockRestore();
                colUtils.createPivotIndexes.mockRestore();
                colUtils.pivotColumnSizeToIndex.mockRestore();
                createPivotConfigModule.createPivotConfig.mockRestore();
                colUtils.calculatePivotDisplayCalcs.mockRestore();
                colUtils.extractLabels.mockRestore();
                dataUtils.createLabelsConfig.mockRestore();
            });

            it('pivot config using row and column Positions', () => {

                const pivotGridOptions = {
                    columnDefinitionType: CUSTOM_COLUMN_DEFINITION.PIVOT,
                    pivotRowPositions: [0],
                    pivotColumnPositions: [1],
                    data: () => [
                        { key: ['1','IT'], value: 100 },
                        { key: ['2','IT'], value: 200 }
                    ]
                };

                createCustomConfig(pivotGridOptions);

                expect(createPivotDisplayCalcsSpy).toHaveBeenCalled();
                // not
                expect(createPivotIndexesSpy).not.toHaveBeenCalled();
                expect(pivotColumnSizeToIndexSpy).not.toHaveBeenCalled();
                expect(createLabelsConfigSpy).not.toHaveBeenCalled();
                expect(extractLabelsSpy).toHaveBeenCalledTimes(2);
                expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalled();
                expect(createPivotConfigSpy).toHaveBeenCalled();
            });

            it('pivot config using row and column dimensions', () => {

                const pivotGridOptions = {
                    columnDefinitionType: CUSTOM_COLUMN_DEFINITION.PIVOT,
                    pivotRowDimensions: ['rowOne'],
                    pivotColumnDimensions: ['ColOne'],
                    data: () => [
                        { key: ['1','IT'], value: 100 },
                        { key: ['2','IT'], value: 200 }
                    ]
                };

                createCustomConfig(pivotGridOptions);

                expect(createPivotDisplayCalcsSpy).toHaveBeenCalled();
                expect(createPivotIndexesSpy).toHaveBeenCalled();
                expect(pivotColumnSizeToIndexSpy).toHaveBeenCalled();
                expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalled();
                expect(extractLabelsSpy).toHaveBeenCalledTimes(2);
                expect(createLabelsConfigSpy).not.toHaveBeenCalled();
                expect(createPivotConfigSpy).toHaveBeenCalled();
            });

            it('pivot config using row and column labels', () => {

                const pivotGridOptions = {
                    columnDefinitionType: CUSTOM_COLUMN_DEFINITION.PIVOT,
                    pivotRowDimensions: ['rowOne'],
                    pivotColumnDimensions: ['ColOne'],
                    pivotRowTitles: ['cl1'],
                    pivotColumnTitles: ['cl1'],
                    data: () => [
                        { key: ['1','IT'], value: 100 },
                        { key: ['2','IT'], value: 200 }
                    ]
                };

                createCustomConfig(pivotGridOptions);

                expect(createPivotDisplayCalcsSpy).toHaveBeenCalled();
                expect(createPivotIndexesSpy).toHaveBeenCalled();
                expect(pivotColumnSizeToIndexSpy).toHaveBeenCalled();
                expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalled();
                expect(extractLabelsSpy).toHaveBeenCalledTimes(2);
                expect(createLabelsConfigSpy).toHaveBeenCalled();
                expect(createPivotConfigSpy).toHaveBeenCalled();
            });

        });


        it('creates config object containing column definitions and table data', () => {

            expect(createCustomConfig(gridOptions)).toEqual(
                {
                    columns: [{
                        cssClass: 'numeric',
                        editable: false,
                        editor: 'input',
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
            gridOptions.columnFilter = true;
            expect(createCustomConfig(gridOptions)).toEqual(
                {
                    columns: [{
                        cssClass: 'numeric',
                        editable: false,
                        editor: 'input',
                        elementType: 'INTEGER',
                        field: 'column 0',
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
        it('creates config object containing empty column definitions data', () => {
            gridOptions.data = () => [];
            expect(createCustomConfig(gridOptions)).toEqual(
                {
                    columns: [],
                    data: []
                }
            );
        });
        it('triggers a row filter function', () => {
            const rowFilter = jest.fn();
            gridOptions.rowFilter = rowFilter;
            createCustomConfig(gridOptions);
            expect(rowFilter).toHaveBeenCalledTimes(4);
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

    describe('createAutoDefinitionColumns', () => {

        it('returns singular column config', () => {
            expect(createAutoDefinitionColumns(1)).toEqual(expect.any(Object));
        });

        it('returns arrays of column configs', () => {
            expect(createAutoDefinitionColumns([1, 2])).toEqual([expect.any(Object), expect.any(Object)]);
        });

        it('returns empty column config when no data', () => {
            expect(createAutoDefinitionColumns([])).toEqual([]);
        });

        it('converts data into column definitions', () => {

            const data = {value: 100, label: 'label', isTrue: true};
            expect(createAutoDefinitionColumns(data)).toEqual([
                {
                    cssClass: 'numeric',
                    editable: false,
                    editor: 'input',
                    elementType: 'INTEGER',
                    field: 'value',
                    id: 'value',
                    sorter: 'number',
                    title: 'value'
                },
                {
                    editor: 'input',
                    editable: false,
                    elementType: 'STRING',
                    field: 'label',
                    id: 'label',
                    sorter: 'string',
                    title: 'label'
                },
                {
                    editor: 'checkbox',
                    editable: false,
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

    describe('createLabelData', () => {

        describe('happy path', () => {

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

          it('creates expected config', () => {
              expect(createLabelData(data)).toEqual([{
                  '0': 123,
                  '1': 456,
                  '2': 789
              }]);
          })
        });


        describe('with mocked utils', () => {
            const colDefinitions = ['definitions'];
            let createLabelDataSpy;
            beforeEach(() => {
                createLabelDataSpy = jest.spyOn(dataUtils, 'convertObjectDataToLabelData');
            });

            afterEach(() => {
                jest.clearAllMocks();
            });


            describe('when validation passes', () => {

                let validateLabelsDataSpy;
                beforeEach(() => {
                    validateLabelsDataSpy = jest.spyOn(colUtils, 'validateLabelsData').mockReturnValue(true);
                })

                it('creates columns if validation passes', () => {
                    createLabelData(colDefinitions);
                    expect(validateLabelsDataSpy).toBeCalledWith(colDefinitions);
                    expect(createLabelDataSpy).toBeCalledWith(colDefinitions);
                });

            });

            describe('when validation fails', () => {

                let validateLabelsDataSpy;
                beforeEach(() => {
                    validateLabelsDataSpy = jest.spyOn(colUtils, 'validateLabelsData').mockImplementation(() => {
                        throw new Error('I am an error');
                    });
                })

                it('creates columns if validation fails', () => {
                    expect(() => {
                        createLabelData(colDefinitions);
                    }).toThrow('I am an error');

                    expect(validateLabelsDataSpy).toBeCalledWith(colDefinitions);
                    expect(createLabelDataSpy).not.toBeCalled();
                });
            });
        });


    });

    describe('createObjectDefinitionColumns', () => {

        const colDefinitions = ['definitions'];
        const data = ['data'];
        let convertObjectColDefinitionsSpy;
        beforeEach(() => {
            convertObjectColDefinitionsSpy = jest.spyOn(colUtils, 'convertObjectColDefinitions');
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('when validation passes', () => {


            let validateSpy;
            beforeEach(() => {
                validateSpy = jest.spyOn(colUtils, 'validateObjectColDefinitions').mockReturnValue(true);
            })

            it('creates columns if validation passes', () => {

                createObjectDefinitionColumns(colDefinitions, data);
                expect(validateSpy).toBeCalledWith(colDefinitions, data);
                expect(convertObjectColDefinitionsSpy).toBeCalledWith(colDefinitions, data);
            });

        });

        describe('when validation fails', () => {

            let validateSpy;
            beforeEach(() => {
                validateSpy = jest.spyOn(colUtils, 'validateObjectColDefinitions').mockImplementation(() => {
                    throw new Error('I am an error');
                });
            })

            it('creates columns if validation passes', () => {
                expect(() => {
                    createObjectDefinitionColumns(colDefinitions, data);
                }).toThrow('I am an error');
                expect(validateSpy).toBeCalledWith(colDefinitions, data);
                expect(convertObjectColDefinitionsSpy).not.toBeCalled();
            });

        });

    });

    describe('createLabelsDefinitionColumns', () => {

        let labeledData;
        let createColSpy;

        beforeEach(() => {
            labeledData = [
                {key: '1', value: 123, label: 'one'},
                {key: '2', value: 456, label: 'two'}
            ];
            createColSpy = jest.spyOn(colUtils, 'createBasicColumnDefinition').mockReturnValue({column: 'config'});
        })

        it('calls createBasicColumnDefinition with each row', () => {
            createLabelsDefinitionColumns(labeledData);
            expect(createColSpy).toHaveBeenCalledTimes(2);
            expect(createColSpy.mock.calls).toEqual([
                [0, 123, 'one'],
                [1, 456, 'two']
            ]);
        });

        afterEach(() => {
            colUtils.createBasicColumnDefinition.mockRestore();
        })

    });

    describe('addGridOptionsProps', () => {

        let gridOptions;
        let columns;
        beforeEach(() => {
            gridOptions = {};
            columns = [{1: 'one'}, {2: 'two'}, {3: 'three'}];
        });

        it('adds column filter', () => {
            gridOptions.columnFilter = true;
            const result = addGridOptionsProps(gridOptions, columns);
            expect(result[0]).toHaveProperty('headerFilter');
            expect(result[1]).toHaveProperty('headerFilter');
            expect(result[2]).toHaveProperty('headerFilter');
        });

        it('freezes correct columns', () => {
            gridOptions.freezeColumns = 2;
            const result = addGridOptionsProps(gridOptions, columns);
            expect(result[0]).toHaveProperty('frozen');
            expect(result[1]).toHaveProperty('frozen');
            expect(result[2]).not.toHaveProperty('frozen');
        });

        it('ignores negative freezeColumns', () => {
            gridOptions.freezeColumns = -1;
            const result = addGridOptionsProps(gridOptions, columns);
            expect(result[0]).not.toHaveProperty('frozen');
            expect(result[1]).not.toHaveProperty('frozen');
            expect(result[2]).not.toHaveProperty('frozen');
        });
        it('handles out of bounds freezeColumns', () => {
            gridOptions.freezeColumns = 4;
            const result = addGridOptionsProps(gridOptions, columns);
            expect(result[0]).toHaveProperty('frozen');
            expect(result[1]).toHaveProperty('frozen');
            expect(result[2]).toHaveProperty('frozen');
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

        it('creates new object with filter props and checkbox editor', () => {
            const col = {
                editor: 'checkbox',
                elementType: 'BOOLEAN',
                field: 'value',
                id: 'value',
                sorter: 'boolean',
                title: 'value'
            };

            expect(configureColumnFilter(col)).toEqual(
                {
                    editor: 'checkbox',
                    elementType: 'BOOLEAN',
                    field: 'value',
                    id: 'value',
                    sorter: 'boolean',
                    title: 'value',
                    headerFilter: 'select',
                    headerFilterFunc: expect.any(Function),
                    headerFilterPlaceholder: 'No Filter',
                    headerFilterEmptyCheck: expect.any(Function),
                    headerFilterParams: expect.any(Object)
                }
            );
        });

        it('does not override passed column config', () => {

            const col = {
                elementType: 'STRING',
                field: 'value',
                id: 'value',
                sorter: 'boolean',
                title: 'value',
                headerFilterParams: 'headerFilterParams',
                headerFilterPlaceholder: 'headerFilterPlaceholder',
                headerFilter: 'headerFilter',
                headerFilterFunc: 'headerFilterFunc',
                headerFilterEmptyCheck: 'headerFilterEmptyCheck'
            };

            expect(configureColumnFilter(col)).toEqual(
                {
                    elementType: 'STRING',
                    field: 'value',
                    id: 'value',
                    sorter: 'boolean',
                    title: 'value',
                    headerFilterParams: 'headerFilterParams',
                    headerFilterPlaceholder: 'headerFilterPlaceholder',
                    headerFilter: 'headerFilter',
                    headerFilterFunc: 'headerFilterFunc',
                    headerFilterEmptyCheck: 'headerFilterEmptyCheck'
                }
            );
        });

        describe('filters', () => {

            const mockFilter = jest.fn();

            let chooseColumnFilterSpy;
            beforeEach(() => {
                chooseColumnFilterSpy = jest.spyOn(gridFilters, 'chooseColumnFilter').mockReturnValue(mockFilter);
            });

            it('can trigger filter ', () => {

                const col = {
                    cssClass: 'numeric',
                    editor: 'input',
                    elementType: 'INTEGER',
                    field: 'value',
                    id: 'value',
                    sorter: 'number',
                    title: 'value'
                };


                const result = configureColumnFilter(col);
                result.headerFilterFunc('a', 'b', 'c', 'd');
                expect(chooseColumnFilterSpy).toHaveBeenCalledWith(col);
                expect(mockFilter).toHaveBeenCalledWith('a', 'b', 'c', 'd');

            });

            afterEach(()=> {
                gridFilters.chooseColumnFilter.mockRestore();
            });
        });
    });

});
