import {pivotDataModule} from "./data-pivot";

export const createPivotConfig = (data, pivotConfig) => {
    const pivotData = pivotDataModule.run(data, pivotConfig);
    return pivotData;
}
