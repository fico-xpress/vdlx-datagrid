import { DataUtils } from '../../../src/types';
import ko from 'knockout';
import { memoize } from 'lodash';
import $ from 'jquery';

type Mockify<T> = { [P in keyof T]: T[P] extends (...L)=> infer K ? jest.Mock<K, Parameters<T[P]>> : T[P] };

export const getEntityMock = memoize((name) => ({
    getIndexSets: jest.fn(),
    getLabelsEntity: jest.fn(),
}));

const modelSchemaMock = {
    getEntity: jest.fn().mockImplementation(getEntityMock),
};

const appMock = {
    getModelSchema: jest.fn().mockReturnValue(modelSchemaMock),
};

const scenarioObserverSubscriptionMock = {
    dispose: jest.fn(),
};

export const scenarioObserverMock = {
    withEntities: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    notify: jest.fn().mockReturnThis(),
    start: jest.fn().mockReturnValue(scenarioObserverSubscriptionMock),
};

const viewMock = {
    getApp: jest.fn().mockReturnValue(appMock),
    withScenarios: jest.fn().mockReturnValue(scenarioObserverMock),
};

const insightMock = {
    isDebugEnabled: jest.fn(),
    getView: jest.fn().mockReturnValue(viewMock),
};

const insightGetterSpy = jest.fn().mockReturnValue(insightMock);

const enumsMock = {
    DataType: {
        UNSUPPORTED: 'UNSUPPORTED',
        BOOLEAN: 'BOOLEAN',
        INTEGER: 'INTEGER',
        REAL: 'REAL',
        STRING: 'STRING',
        SET: 'SET',
        ARRAY: 'ARRAY',
        DECISION_VARIABLE: 'DECISION_VARIABLE',
        CONSTRAINT: 'CONSTRAINT',
        MODEL: 'MODEL',
        CONSTRAINT_TYPE: 'CONSTRAINT_TYPE',
        VARIABLE_TYPE: 'VARIABLE_TYPE',
        PROBLEM_STATUS: 'PROBLEM_STATUS',
    },
    EntityManagementType: {
        DEFAULT: 'DEFAULT',
        INPUT: 'INPUT',
        RESULT: 'RESULT',
        IGNORE: 'IGNORE',
    },
};


export const dataUtilsSpy: Mockify<DataUtils> = {
    entityTypeIsNumber: jest.fn().mockReturnValue(false),
    getFilterPositionsAndValues: jest.fn(),
    getSetNamesAndPosns: jest.fn(),
};

export const setSorterSpy = {
        getComparator: jest.fn(),
        callSetSorter: jest.fn(),
        getInsightArraySortedKeys: jest.fn(),
}

const vdlValidatorRegistrySpy = jest.fn();

const validatorFactorySpy = jest.fn();

const dialogsSpy = jest.fn().mockReturnValue({
    alert: jest.fn(),
});

jest.doMock('../../../src/js/insight-modules', () => ({
    insightGetter: insightGetterSpy,
    ko: ko,
    $: $,
    enums: enumsMock,
    dataUtils: dataUtilsSpy,
    vdlValidatorRegistry: vdlValidatorRegistrySpy,
    vdlValidatorFactory: validatorFactorySpy,
    dialogs: dialogsSpy,
    createSparseData: jest.fn(),
    createDenseData: jest.fn(),
    autotableSelectOptions: jest.fn(),
    setSorter: setSorterSpy,
}));
