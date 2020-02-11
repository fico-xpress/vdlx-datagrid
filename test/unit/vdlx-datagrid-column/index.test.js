import '../../../src/js/vdlx-datagrid-column';

import { VDL } from '../../../src/js/insight-globals';
import attributes from '../../../src/js/vdlx-datagrid-column/attributes';
import transform from '../../../src/js/vdlx-datagrid-column/transform';
import viewModel from '../../../src/js/vdlx-datagrid-column/view-model';

jest.mock('../../../src/js/vdlx-datagrid-column/attributes');
jest.mock('../../../src/js/vdlx-datagrid-column/transform');
jest.mock('../../../src/js/vdlx-datagrid-column/view-model');

describe('vdlx-datagrid-column', () => {
    it('calls VDL to register as an extension', () => {
        expect(VDL).toHaveBeenCalledWith('vdlx-datagrid-column', {
            tag: 'vdlx-datagrid-column',
            attributes: attributes,
            createViewModel: viewModel,
            transform: transform,
            modifiesDescendants: false,
            errorTargetSelector: expect.any(Function),
            template: '<vdl-contents></vdl-contents>'
        });
    });
});
