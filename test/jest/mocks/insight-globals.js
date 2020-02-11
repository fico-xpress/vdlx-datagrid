import ko from 'knockout';

const insightModules = {
    load: jest.fn()
};
const VDL = jest.fn();
const insight = {};

const dataUtilsSpy = jest.fn();
const createSparseDataSpy = jest.fn();
const createDenseDataSpy = jest.fn();
const autotableSelectOptionsSpy = jest.fn();
const dialogsSpy = jest.fn().mockReturnValue({
    alert: jest.fn()
});
const enumsSpy = jest.fn().mockReturnValue({
    DataType: {},
    EntityManagementType: {}
});
const validatorFactorySpy = jest.fn();
const insightGetterSpy = jest.fn().mockReturnValue(insight);
const vdlValidatorRegistrySpy = jest.fn();

const modules = {
    'utils/data-utils': dataUtilsSpy,
    'vdl-validator-registry': vdlValidatorRegistrySpy,
    'vdl/vdl-validator-factory': validatorFactorySpy,
    'dialogs': dialogsSpy,
    'insight-getter': insightGetterSpy,
    'enums': enumsSpy,
    'external-libs/knockout': ko,
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
        this.disconnect = jest.fn();
        this.observe = jest.fn();
    }
};