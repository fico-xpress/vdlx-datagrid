import '../../../src/js/vdlx-datagrid';
import {VDL} from '../../../src/js/insight-globals';
import metadata from '../../../src/js/vdlx-datagrid/metadata';
import transform from '../../../src/js/vdlx-datagrid/transform';
import viewModel from '../../../src/js/vdlx-datagrid/view-model';

jest.mock('../../../src/js/vdlx-datagrid/metadata', () => ({
    tag: 'test-tag',
    attributes: 'test-attr',
    modifiesDescendants: 'test-desc'
}));
jest.mock('../../../src/js/vdlx-datagrid/transform');
jest.mock('../../../src/js/vdlx-datagrid/view-model');

describe('vdlx-datagrid', () => {
    it('calls VDL to register as an extension', () => {
        expect(VDL).toBeCalledWith(metadata.tag, {
            tag: metadata.tag,
            attributes: metadata.attributes,
            createViewModel: viewModel,
            transform,
            modifiesDescendants: metadata.modifiesDescendants
        });
    });

});
