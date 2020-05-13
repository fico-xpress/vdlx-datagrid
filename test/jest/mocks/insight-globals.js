const VDL = jest.fn();

jest.doMock('../../../src/js/insight-globals', () => ({
    VDL
}));
