export const componentParamsBuilder = {
    'addParam': jest.fn(),
    'addRawOrExpressionParam': jest.fn(),
    'addFunctionOrExpressionParam': jest.fn(),
    'getParam': jest.fn(),
    'hasParams': jest.fn(),
    'getSerializedParams': jest.fn(),
    'addParentCallbackParam': jest.fn()
};

export const extensionApiMock = {
    getComponentParamsBuilder: jest.fn((element) => {
        return componentParamsBuilder;
    })
}

