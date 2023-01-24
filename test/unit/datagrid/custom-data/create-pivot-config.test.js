import {createPivotConfig} from '../../../../src/js/datagrid/custom-data/create-pivot-config';
import {pivotDataModule} from "../../../../src/js/datagrid/custom-data/custom-data-pivot";
import {CUSTOM_COLUMN_DEFINITION} from "../../../../src/js/constants";
import * as colUtils from "../../../../src/js/datagrid/custom-data/custom-column-utils";
import {
    calculatePivotDisplayCalcs,
    extractLabels,
    pivotColumnSizeToIndex,
    pivotRowSizeToIndex,
    validatePivotRowsAndColumns,
    validateSetPosition
} from "../../../../src/js/datagrid/custom-data/custom-column-utils";
import * as dataUtils from '../../../../src/js/datagrid/custom-data/custom-data-utils';
import {createLabelsConfig} from '../../../../src/js/datagrid/custom-data/custom-data-utils';

describe('custom-data-pivot module', () => {

    describe('uses utils to create config', () => {

        const returnParam = (param) => param;

        let pivotModuleSpy;
        let data;
        let pivotedData;

        let validateDimensionsSpy;
        let validateSetPositionSpy;
        let pivotRowSizeToIndexSpy
        let pivotColumnSizeToIndexSpy
        let validatePivotRowsAndColumnsSpy
        let calculatePivotDisplayCalcsSpy
        let extractLabelsSpy
        let createLabelsConfigSpy

        beforeEach(() => {

            pivotedData = {data: 'pivotedData'}
            pivotModuleSpy = jest.spyOn(pivotDataModule, 'run').mockReturnValue(pivotedData);
            data = [{key: [1, 2, 3, 4], value: 1234}];


            // column utils
            validateDimensionsSpy = jest.spyOn(colUtils, 'validateDimensions').mockImplementation(returnParam);
            validateSetPositionSpy = jest.spyOn(colUtils, 'validateSetPosition').mockImplementation(returnParam);
            pivotRowSizeToIndexSpy = jest.spyOn(colUtils, 'pivotRowSizeToIndex').mockReturnValue([0]);
            pivotColumnSizeToIndexSpy = jest.spyOn(colUtils, 'pivotColumnSizeToIndex').mockReturnValue([1]);
            validatePivotRowsAndColumnsSpy = jest.spyOn(colUtils, 'validatePivotRowsAndColumns').mockReturnValue(true);
            calculatePivotDisplayCalcsSpy = jest.spyOn(colUtils, 'calculatePivotDisplayCalcs').mockReturnValue('display');
            extractLabelsSpy = jest.spyOn(colUtils, 'extractLabels').mockReturnValue(returnParam);
            // data utils
            createLabelsConfigSpy = jest.spyOn(dataUtils, 'createLabelsConfig').mockReturnValue({label: 'config'});
        });

        afterEach(() => {
            // column utils
            colUtils.validateDimensions.mockRestore();
            colUtils.validateSetPosition.mockRestore();
            colUtils.pivotRowSizeToIndex.mockRestore();
            colUtils.pivotColumnSizeToIndex.mockRestore();
            colUtils.validatePivotRowsAndColumns.mockRestore();
            colUtils.calculatePivotDisplayCalcs.mockRestore();
            colUtils.extractLabels.mockRestore();
            // data utils
            dataUtils.createLabelsConfig.mockRestore();
            pivotDataModule.run.mockRestore();
        });


        it('validates row and column dimension attrs', () => {

            const gridOptions = {
                columnDefinitionType: CUSTOM_COLUMN_DEFINITION.PIVOT,
                columnDefinitions: () => [{column: 'definition'}],
                data: () => [{key: [1, 2, 3, 4], value: 1234}],
                pivotRowDimensions: ['row one'],
                pivotRowTitles: [],
                displayPivotRowCalc: true,
                pivotColumnDimensions: ['column one'],
                pivotColumnTitles: [],
                displayPivotColumnCalc: false

            };


            expect(createPivotConfig(gridOptions, data)).toBe(pivotedData);

            // validate the dimensions attrs
            expect(validateDimensionsSpy).toHaveBeenCalledTimes(2);

            // does not validate the setPositions attrs
            expect(validateSetPositionSpy).not.toHaveBeenCalled();

            const validatingRowCalls = validateDimensionsSpy.mock.calls[0];
            expect(validatingRowCalls[0]).toEqual(gridOptions.pivotRowDimensions);
            expect(validatingRowCalls[1]).toEqual('row-dimensions');

            const validatingColumnCalls = validateDimensionsSpy.mock.calls[1];
            expect(validatingColumnCalls[0]).toEqual(gridOptions.pivotColumnDimensions);
            expect(validatingColumnCalls[1]).toEqual('column-dimensions');

            expect(pivotRowSizeToIndexSpy).toHaveBeenCalledTimes(1);
            expect(pivotRowSizeToIndexSpy).toHaveBeenCalledWith(1);

            expect(pivotColumnSizeToIndexSpy).toHaveBeenCalledTimes(1);
            expect(pivotColumnSizeToIndexSpy).toHaveBeenCalledWith(4, 1, 1);

            expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalledTimes(1);
            expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalledWith([0], [1], 4);

            expect(calculatePivotDisplayCalcsSpy).toHaveBeenCalledWith(gridOptions.displayPivotRowCalc, gridOptions.displayPivotColumnCalc);

            // dimensions attrs passed, so classed as headers
            expect(createLabelsConfigSpy).toHaveBeenCalled();

            expect(extractLabelsSpy).toHaveBeenCalledTimes(2);
            expect(extractLabelsSpy.mock.calls[0][0]).toEqual(gridOptions.pivotRowDimensions);
            expect(extractLabelsSpy.mock.calls[1][0]).toEqual(gridOptions.pivotColumnDimensions);

            expect(pivotModuleSpy).toHaveBeenCalled();
        });


        it('validates row and column set position attrs', () => {

            const gridOptions = {
                columnDefinitionType: CUSTOM_COLUMN_DEFINITION.PIVOT,
                columnDefinitions: () => [{column: 'definition'}],
                data: () => [{key: [1, 2, 3, 4], value: 1234}],
                pivotRowPositions: 0,
                pivotRowTitles: [],
                displayPivotRowCalc: true,
                pivotColumnPositions: 1,
                pivotColumnTitles: [],
                displayPivotColumnCalc: false

            };


            expect(createPivotConfig(gridOptions, data)).toBe(pivotedData);

            // does not validate the dimensions attrs
            expect(validateDimensionsSpy).not.toHaveBeenCalled();

            // validates the setPositions attrs
            expect(validateSetPositionSpy).toHaveBeenCalledTimes(2);

            const validateSetPositionSpyCalls = validateSetPositionSpy.mock.calls;

            expect(validateSetPositionSpyCalls[0][0]).toEqual([gridOptions.pivotRowPositions]);
            expect(validateSetPositionSpyCalls[0][1]).toEqual('row-set-position');

            expect(validateSetPositionSpyCalls[1][0]).toEqual([gridOptions.pivotColumnPositions]);
            expect(validateSetPositionSpyCalls[1][1]).toEqual('column-set-position');

            expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalledTimes(1);
            expect(validatePivotRowsAndColumnsSpy).toHaveBeenCalledWith([0], [1], 4);

            expect(calculatePivotDisplayCalcsSpy).toHaveBeenCalledWith(gridOptions.displayPivotRowCalc, gridOptions.displayPivotColumnCalc);

            // set position attrs passed, so no headers
            expect(createLabelsConfigSpy).toHaveBeenCalled();
            //
            expect(extractLabelsSpy).toHaveBeenCalledTimes(2);
            expect(extractLabelsSpy.mock.calls[0][0]).toEqual(gridOptions.pivotRowDimensions);
            expect(extractLabelsSpy.mock.calls[1][0]).toEqual(gridOptions.pivotColumnDimensions);

            expect(pivotModuleSpy).toHaveBeenCalled();
        });

    });


});

