import createColumnConfig from '../../../src/js/vdlx-datagrid/create-column-config';

describe('createColumnConfig', () => {
    describe('calculated columns', () => {
        it('creates calculated column config', () => {

            expect(createColumnConfig([{ render: 'render' }], 'defaultscenario', 'tableId')).toEqual({
                calculatedColumnsOptions: [{ render: 'render' }],
                columnOptions: [],
                indicesOptions: {},
                scenarioList: []
            });
        })
    })
});
