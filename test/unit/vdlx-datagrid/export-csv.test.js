import createExportCsv from '../../../src/js/vdlx-datagrid/export-csv';

describe('export-csv', () => {
    let table;
    let container;

    describe('export-csv', () => {
        beforeEach(() => {
            container = document.createElement('DIV');
            table = {
                download: jest.fn()
            };
        });

        it('creates export csv control.', () => {
            createExportCsv(table, container);
            expect(container.firstChild.classList.contains('export-csv-control')).toBeTruthy();
            expect(container.firstChild.firstChild.classList.contains('pull-right')).toBeTruthy();
            expect(container.firstChild.firstChild.firstChild.tagName.toLowerCase()).toEqual('button');
        });

        it('button is disabled by default.', () => {
            createExportCsv(table, container);
            let exportButton = container.getElementsByTagName('button')[0];
            expect(exportButton.enabled).toBeFalsy();
        });

        it('destroys export csv control.', () => {
            let exportCsv = createExportCsv(table, container);
            expect(container.firstChild.classList.contains('export-csv-control')).toBeTruthy();
            exportCsv.dispose();
            expect(container.firstChild).toBeNull();
        });

        it('enable export button.', () => {
            let exportCsv = createExportCsv(table, container);
            let exportButton = container.getElementsByTagName('button')[0];
            expect(exportButton.tagName.toLowerCase()).toEqual('button');
            exportCsv.enable(100);
            expect(exportButton.disabled).toBeFalsy();
        });

        it('disable export button.', () => {
            let exportCsv = createExportCsv(table, container);
            let exportButton = container.getElementsByTagName('button')[0];
            expect(exportButton.tagName.toLowerCase()).toEqual('button');
            exportCsv.enable(0);
            expect(exportButton.disabled).toBeTruthy();
        });

        it('tabulator.download called using export-filename attribute.', () => {
            createExportCsv(table, container, 'exportfile');
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.removeAttribute('disabled');
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'exportfile.csv');
        });

        it('tabulator.download called using default value when export-filename attribute is undefined.', () => {
            createExportCsv(table, container);
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.removeAttribute('disabled');
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });

        it('tabulator.download called using default value when export-filename attribute is empty string.', () => {
            createExportCsv(table, container, ' ');
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.removeAttribute('disabled');
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });

        it('tabulator.download called using default value when export-filename attribute is empty.', () => {
            createExportCsv(table, container, '');
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.removeAttribute('disabled');
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });

    });

});