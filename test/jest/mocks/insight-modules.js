import ko from 'knockout';

const insightMock = {
    isDebugEnabled: jest.fn(),
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

const dataUtilsSpy = {
    entityTypeIsNumber: jest.fn().mockReturnValue(false),
};

const vdlValidatorRegistrySpy = jest.fn();

const validatorFactorySpy = jest.fn();

const dialogsSpy = jest.fn().mockReturnValue({
    alert: jest.fn(),
});

jest.doMock('../../../src/js/insight-modules', () => ({
    insightGetter: insightGetterSpy,
    ko: ko,
    enums: enumsMock,
    dataUtils: dataUtilsSpy,
    vdlValidatorRegistry: vdlValidatorRegistrySpy,
    vdlValidatorFactory: validatorFactorySpy,
    dialogs: dialogsSpy,
    createSparseData: jest.fn(),
    createDenseData: jest.fn(),
    autotableSelectOptions: jest.fn(),
    setSorter: {
        getComparator: jest.fn(),
        callSetSorter: jest.fn(),
        getInsightArraySortedKeys: jest.fn(),
    },
}));
