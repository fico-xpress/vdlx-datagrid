import ko from 'knockout';

const insightModules = {
    load: jest.fn()
};
const VDL = jest.fn();
const insight = {
    isDebugEnabled: jest.fn()
};

const dataUtilsSpy = {
    entityTypeIsNumber: jest.fn().mockReturnValue(false)
};
const createSparseDataSpy = jest.fn();
const createDenseDataSpy = jest.fn();
const autotableSelectOptionsSpy = jest.fn();
const dialogsSpy = jest.fn().mockReturnValue({
    alert: jest.fn()
});
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
        PROBLEM_STATUS: 'PROBLEM_STATUS'
    },
    EntityManagementType: {
        DEFAULT: 'DEFAULT',
        INPUT: 'INPUT',
        RESULT: 'RESULT',
        IGNORE: 'IGNORE'
    }
};
const validatorFactorySpy = jest.fn();
const insightGetterSpy = jest.fn().mockReturnValue(insight);
const vdlValidatorRegistrySpy = jest.fn();

const modules = {
    'utils/data-utils': dataUtilsSpy,
    'vdl-validator-registry': vdlValidatorRegistrySpy,
    'vdl/vdl-validator-factory': validatorFactorySpy,
    'dialogs': dialogsSpy,
    'insight-getter': insightGetterSpy,
    'external-libs/knockout': ko,
    'enums': enumsMock,
    'components/table/create-sparse-data': createSparseDataSpy,
    'components/table/create-dense-data': createDenseDataSpy,
    'components/autotable-select-options': autotableSelectOptionsSpy
};

insightModules.load.mockImplementation((name) => {
    if (!modules.hasOwnProperty(name)) {
        throw Error(`Unmocked insightModule ${name}`);
    }
    return modules[name];
});

jest.doMock('../../../src/js/insight-globals', () => {
    return {
        insight,
        VDL,
        insightModules
    }
});

global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback;
        this.disconnect = global.MutationObserver.disconnect;
        this.observe = global.MutationObserver.observe;
    }
};
global.MutationObserver.disconnect = jest.fn();
global.MutationObserver.observe = jest.fn();