import {
    getSorter,
    createFormattedSorter,
    getSetSorter
} from '../../../src/js/vdlx-datagrid/datagrid-sorter';
import {insightModules} from '../../../src/js/insight-globals';

describe('datagrid-sorter', () => {
    let tabulatorSortersMock;
    let entityMock;
    let enumsMock;
    let dataUtilsMock;
    let setSorterMock;

    beforeEach(() => {
        enumsMock = insightModules.load('enums');
        dataUtilsMock = insightModules.load('utils/data-utils');
        setSorterMock = insightModules.load('data/set-sorter');
        tabulatorSortersMock = {
            alphanum: 'alphanum-sorter',
            number: 'number-sorter',
            boolean: 'boolean-sorter'
        };
        entityMock = {
            getName: jest.fn(),
            getElementType: jest.fn()
        };
    });

    describe('with getSetSorter', () => {
        let discoveredComparator;

        beforeEach(() => {
            entityMock.getName.mockReturnValue('MY_SET');
            discoveredComparator = jest.fn();
            setSorterMock.getComparator.mockReturnValue(discoveredComparator);
        });

        it('returns the set sorter from the JS API', () => {
            expect(getSetSorter(entityMock)).toBe(discoveredComparator);
        });

        it('calls getComparator with ignoreDirection', () => {
            expect(setSorterMock.getComparator).toBeCalledWith('MY_SET', true);
        });
    });

    describe('with getSorter', () => {
        describe('when entity is a number type', () => {
            beforeEach(() => {
                entityMock.getElementType.mockReturnValue(enumsMock.DataType.INTEGER);
                dataUtilsMock.entityTypeIsNumber.mockReturnValue(true);
            });

            it('returns the number sorter', () => {
                expect(getSorter(entityMock, tabulatorSortersMock)).toBe(tabulatorSortersMock.number);
            });
        });

        describe('when entity is a boolean type', () => {
            beforeEach(() => {
                entityMock.getElementType.mockReturnValue(enumsMock.DataType.BOOLEAN);
                dataUtilsMock.entityTypeIsNumber.mockReturnValue(false);
            });

            it('returns the number sorter', () => {
                expect(getSorter(entityMock, tabulatorSortersMock)).toBe(tabulatorSortersMock.boolean);
            });
        });

        describe('when entity is a string type', () => {
            beforeEach(() => {
                entityMock.getElementType.mockReturnValue(enumsMock.DataType.STRING);
                dataUtilsMock.entityTypeIsNumber.mockReturnValue(false);
            });

            it('returns the number sorter', () => {
                expect(getSorter(entityMock, tabulatorSortersMock)).toBe(tabulatorSortersMock.alphanum);
            });
        });

        describe('when entity is a real type', () => {
            beforeEach(() => {
                entityMock.getElementType.mockReturnValue(enumsMock.DataType.REAL);
                dataUtilsMock.entityTypeIsNumber.mockReturnValue(true);
            });

            it('returns the number sorter', () => {
                expect(getSorter(entityMock, tabulatorSortersMock)).toBe(tabulatorSortersMock.number);
            });
        });
    });

    describe('with createFormattedSorter', () => {
        let sortCallback;
        let formatterMock;
        let aMock;
        let bMock;
        let aRowMock;
        let bRowMock;
        let columnMock;
        let dir;
        let sorterParams;

        beforeEach(() => {
            formatterMock = jest.fn(cell => `formatted-${cell.getValue()}`);
            tabulatorSortersMock.alphanum = jest.fn().mockReturnValue('tabulator-sorter-result');
            sortCallback = createFormattedSorter('column-id-1', formatterMock, tabulatorSortersMock);
            aMock = 10;
            bMock = 20;
            aRowMock = {
                getData: jest.fn().mockReturnValue('aRowMock-result')
            };
            bRowMock = {
                getData: jest.fn().mockReturnValue('bRowMock-result')
            };
            columnMock = jest.fn();
            dir = 'asc';
            sorterParams = {};
        });

        describe('when formatter is called with cell values and valid formatter', () => {
            let result;

            beforeEach(() => {
                result = sortCallback(aMock, bMock, aRowMock, bRowMock, columnMock, dir, sorterParams);
            });

            it('should call the formatter function on both cells', () => {
                expect(formatterMock).toBeCalledWith({
                    getValue: expect.any(Function),
                    getData: expect.any(Function)
                });
                expect(formatterMock).toBeCalledTimes(2);
                expect(formatterMock.mock.calls[0][0].getValue()).toBe(aMock);
                expect(formatterMock.mock.calls[0][0].getData()).toBe('aRowMock-result');
                expect(formatterMock.mock.calls[1][0].getValue()).toBe(bMock);
                expect(formatterMock.mock.calls[1][0].getData()).toBe('bRowMock-result');
            });

            it('should call the alphanum tabulator sorter with expected arguments', () => {
                expect(tabulatorSortersMock.alphanum).toBeCalledWith(
                    'formatted-10',
                    'formatted-20',
                    aRowMock,
                    bRowMock,
                    columnMock,
                    dir,
                    sorterParams
                );
            });

            it('returns the sorter result value', () => {
                expect(result).toBe('tabulator-sorter-result');
            });
        });

        describe('when called and a tabulator sorter error occurs', () => {
            let result;
            let error;

            beforeEach(() => {
                error = Error('sorter-error');
                tabulatorSortersMock.alphanum.mockImplementation(() => {
                    throw error;
                });
                sortCallback = createFormattedSorter('column-id-1', formatterMock, tabulatorSortersMock);
                result = sortCallback(aMock, bMock, aRowMock, bRowMock, columnMock, dir, sorterParams);
            });

            it('returns empty value', function () {
                expect(result).toBeUndefined();
            });

            it('outputs an error log message', function () {
                expect(global.console.error).toBeCalledWith(
                    expect.stringContaining('column-id-1. sorter-error'),
                    error
                );
            });
        });

        describe('when called and a formatter error occurs', () => {
            let result;
            let error;

            beforeEach(() => {
                error = Error('formatter-error');
                formatterMock.mockImplementation(() => {
                    throw error;
                });
                result = sortCallback(aMock, bMock, aRowMock, bRowMock, columnMock, dir, sorterParams);
            });

            it('returns empty value', function () {
                expect(result).toBeUndefined();
            });

            it('outputs an error log message', function () {
                expect(global.console.error).toBeCalledWith(
                    expect.stringContaining('column-id-1. formatter-error'),
                    error
                );
            });
        });
    });
});