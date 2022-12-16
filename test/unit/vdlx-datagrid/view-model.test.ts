import createViewModel from '../../../src/js/vdlx-datagrid/view-model';
import Datagrid from '../../../src/js/datagrid/datagrid';
import { createMutationObservable } from '../../../src/js/ko-utils';
import ko from 'knockout';
import noop from 'lodash/noop';

const DatagridMock = Datagrid as jest.MockedClass<typeof Datagrid>;

jest.mock('../../../src/js/datagrid/datagrid');
jest.mock('../../../src/js/ko-utils', () => {
    const actualUtils = jest.requireActual('../../../src/js/ko-utils');
    return {
        ...actualUtils,
        createMutationObservable: jest.fn(),
    };
});

describe('vdlx-datagrid view mode', () => {
    let viewModel;
    /** @type {HTMLElement} */
    let rootElement;

    let element;

    let tableOptions$;
    let columnConfig$;
    let filters$;
    let mutationObservable;
    beforeEach(() => {
        DatagridMock.mockClear();
        rootElement = document.createElement('div');
        mutationObservable = ko.observable();
        createMutationObservable.mockReturnValue(mutationObservable);
        viewModel = createViewModel({}, { element: rootElement });
        [element, tableOptions$, columnConfig$, filters$] = DatagridMock.mock.calls[0];
    });

    describe('index filtering', () => {
        it('is initialized to an empty object', () => {
            expect(filters$()).toEqual({});
        });

        it(`ignores updates when there's a mismatch between filters and tags`, () => {
            expect(filters$()).toEqual({});
            viewModel.filterUpdate('filterId', 'filter-properties');
            expect(filters$()).toEqual({});
        });

        it(`ignores updates when there's a mismatch between filters and tags`, () => {
            expect(filters$()).toEqual({});
            viewModel.filterUpdate('filterId', 'filter-properties');
            expect(filters$()).toEqual({});
        });
        it('adds a filter', () => {
            expect(filters$()).toEqual({});
            const newIndexFilterElm = document.createElement('vdlx-datagrid-index-filter');
            rootElement.appendChild(newIndexFilterElm);

            const subscription = filters$.subscribe(noop);
            mutationObservable(1);
            viewModel.filterUpdate('filterId', 'filter-properties');
            expect(filters$()).toEqual({ filterId: 'filter-properties' });
            subscription.dispose();
        });

        it('adds a filter', () => {
            expect(filters$()).toEqual({});
            const newIndexFilterElm = document.createElement('vdlx-datagrid-index-filter');
            rootElement.appendChild(newIndexFilterElm);

            const subscription = filters$.subscribe(noop);
            mutationObservable(1);
            viewModel.filterUpdate('filterId', 'filter-properties');
            expect(filters$()).toEqual({ filterId: 'filter-properties' });
            viewModel.filterRemove('filterId');
            expect(filters$()).toEqual({ filterId: 'filter-properties' });
            subscription.dispose();
        });
    });
});
