import {createPivotConfig} from '../../../../src/js/datagrid/custom-data/create-pivot-config';
import {pivotDataModule} from "../../../../src/js/datagrid/custom-data/custom-data-pivot";

describe('custom-data-pivot module', () => {
    let pivotModuleSpy;
    const pivotedData = {data: 'pivotedData'};

    beforeEach(() => {
        pivotModuleSpy = jest.spyOn(pivotDataModule, 'run').mockReturnValue(pivotedData);
    });

    afterEach(() => {
        pivotDataModule.run.mockRestore();
    });

    it('passes config onto the pivotModule', () => {
        const data = 'data';
        const pivotConfig = 'config'
        createPivotConfig(data, pivotConfig);
        expect(pivotModuleSpy).toHaveBeenCalledWith(data, pivotConfig);
    });

    it('returns data from pivotModule', () => {
        expect(createPivotConfig('data', 'config')).toBe(pivotedData);
    });
});
