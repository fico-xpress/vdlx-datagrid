import '../../../src/js/vdlx-datagrid-column';
import {VDL} from '../../../src/js/insight-globals';
import metadata from '../../../src/js/vdlx-datagrid-column/metadata';
import transform from '../../../src/js/vdlx-datagrid-column/transform';
import viewModel from '../../../src/js/vdlx-datagrid-column/view-model';

jest.mock('../../../src/js/vdlx-datagrid-column/metadata', () => ({
    tag: 'test-tag',
    attributes: 'test-attr',
    modifiesDescendants: 'test-desc'
}));
jest.mock('../../../src/js/vdlx-datagrid-column/transform');
jest.mock('../../../src/js/vdlx-datagrid-column/view-model');

describe('vdlx-datagrid-column', () => {
    it('calls VDL to register as an extension', () => {
        expect(VDL).toHaveBeenCalledWith(metadata.tag, {
            tag: metadata.tag,
            attributes: metadata.attributes,
            createViewModel: viewModel,
            transform: transform,
            modifiesDescendants: metadata.modifiesDescendants,
            errorTargetSelector: expect.any(Function),
            template: '<vdl-contents></vdl-contents>'
        });
    });
});
