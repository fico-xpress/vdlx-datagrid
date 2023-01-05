import createViewModel from '../../../src/js/vdlx-pivotgrid/view-model';
import Datagrid from '../../../src/js/datagrid/datagrid';

const DatagridMock = Datagrid as jest.MockedClass<typeof Datagrid>;
jest.mock('../../../src/js/datagrid/datagrid');

describe('vdlx-pivotgrid view mode', () => {

    describe('markup', () => {
        let viewModel;
        /** @type {HTMLElement} */
        let rootElement;
        let element;
        let tableOptions$;

        beforeEach(() => {
            DatagridMock.mockClear();
            rootElement = document.createElement('div');

            viewModel = createViewModel({}, {element: rootElement});
            [element, tableOptions$] = DatagridMock.mock.calls[0];
        });

        it('creates toolbars and datagrid', () => {
            const headerToolbar = element.querySelector('.header-toolbar');
            expect(headerToolbar.nodeName).toBe('DIV');
            expect(headerToolbar.classList.value).toBe('header-toolbar');

            const datagrid = element.querySelector('.vdlx-pivotgrid');
            expect(datagrid.nodeName).toBe('DIV');
            expect(datagrid.classList.value).toBe('vdlx-pivotgrid table-striped table-bordered table-condensed');

            const footerToolbar = element.querySelector('.footer-toolbar');
            expect(footerToolbar.nodeName).toBe('DIV');
            expect(footerToolbar.classList.value).toBe('footer-toolbar');

            const hiddenFooterToolbar = element.querySelector('.hidden-footer-toolbar');
            expect(hiddenFooterToolbar.nodeName).toBe('DIV');
            expect(hiddenFooterToolbar.classList.value).toBe('hidden-footer-toolbar');
            expect(hiddenFooterToolbar.style.display).toBe('none');
        });
    });

    describe('params', () => {
        let viewModel;
        let params;
        let rootElement;
        let element;
        let tableOptions$;

        beforeEach(() => {
            DatagridMock.mockClear();
            rootElement = document.createElement('div');
        });

        it('strips units from width', () => {

            params = {
                width: '600px'
            }

            viewModel = createViewModel(params, {element: rootElement});
            [element, tableOptions$] = DatagridMock.mock.calls[0];

            expect(viewModel.tableWidth).toBe('600');
        });

        it('adds css class from params', () => {

            params = {
                class: 'my-class'
            }

            viewModel = createViewModel(params, {element: rootElement});
            [element, tableOptions$] = DatagridMock.mock.calls[0];

            const datagrid = element.querySelector('.vdlx-pivotgrid');
            expect(datagrid.classList.value).toBe('vdlx-pivotgrid table-striped table-bordered table-condensed my-class');

        });

    });


    describe('disposes of datagrid', () => {

        let viewModel;
        let rootElement;

        beforeEach(() => {
            DatagridMock.mockClear();
            rootElement = document.createElement('div');
            viewModel = createViewModel({}, {element: rootElement});
        });

        it('viewModel dispose calls datagrid dispose', () => {
            const datagridMockInstance = DatagridMock.mock.instances[0];
            viewModel.dispose();
            expect(datagridMockInstance.dispose).toHaveBeenCalled();
        });

    });

});
