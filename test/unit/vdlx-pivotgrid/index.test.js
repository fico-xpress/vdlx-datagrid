import '../../../src/js/vdlx-pivotgrid';
import {VDL} from '../../../src/js/insight-globals';
import metadata from '../../../src/js/vdlx-pivotgrid/metadata';
import transform from '../../../src/js/vdlx-pivotgrid/transform';
import viewModel from '../../../src/js/vdlx-pivotgrid/view-model';

jest.mock('../../../src/js/vdlx-pivotgrid/metadata', () => ({
    tag: 'test-tag',
    attributes: 'test-attr',
    modifiesDescendants: 'test-desc'
}));
jest.mock('../../../src/js/vdlx-pivotgrid/transform');
jest.mock('../../../src/js/vdlx-pivotgrid/view-model');

describe('vdlx-pivotgrid', () => {
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
