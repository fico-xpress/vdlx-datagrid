import createExportCsv from '../../../src/js/datagrid/export-csv';

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

        it('creates export csv control', () => {
            createExportCsv(table, container, {});
            expect(container.firstChild.classList.contains('export-csv-control')).toBeTruthy();
            expect(container.firstChild.firstChild.classList.contains('pull-right')).toBeTruthy();
            expect(container.firstChild.firstChild.firstChild.tagName.toLowerCase()).toEqual('button');
        });

        it('button is disabled by default', () => {
            createExportCsv(table, container, {});
            let exportButton = container.getElementsByTagName('button')[0];
            expect(exportButton.enabled).toBeFalsy();
        });

        it('destroys export csv control', () => {
            let exportCsv = createExportCsv(table, container, {});
            expect(container.firstChild.classList.contains('export-csv-control')).toBeTruthy();
            exportCsv.dispose();
            expect(container.firstChild).toBeNull();
        });

        it('enable export button', () => {
            createExportCsv(table, container, {enabled: true});
            let exportButton = container.getElementsByTagName('button')[0];
            expect(exportButton.tagName.toLowerCase()).toEqual('button');
            expect(exportButton.disabled).toBeFalsy();
        });

        it('tabulator.download called using export-filename attribute', () => {
            createExportCsv(table, container, {enabled: true, filename: 'exportfile'});
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'exportfile.csv');
        });

        it('tabulator.download called using default filename when export-filename not specified', () => {
            createExportCsv(table, container, {enabled: true});
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });

        it('tabulator.download called using default value when export-filename attribute is empty string', () => {
            createExportCsv(table, container, {enabled: true, filename: ' '});
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });

        it('tabulator.download called using default value when export-filename attribute is empty.', () => {
            createExportCsv(table, container, {enabled: true, filename: ''});
            let exportButton = container.getElementsByTagName('button')[0];
            exportButton.click();
            expect(table.download).toHaveBeenCalledWith('csv', 'data.csv');
        });
    });
});
