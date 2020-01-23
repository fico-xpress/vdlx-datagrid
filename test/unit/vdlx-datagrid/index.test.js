import '../../../src/js/vdlx-datagrid';

import {VDL} from '../../../src/js/insight-globals';
import attributes from '../../../src/js/vdlx-datagrid/attributes';
import transform from '../../../src/js/vdlx-datagrid/transform';
import viewModel from '../../../src/js/vdlx-datagrid/view-model';

jest.mock('../../../src/js/vdlx-datagrid/attributes');
jest.mock('../../../src/js/vdlx-datagrid/transform');
jest.mock('../../../src/js/vdlx-datagrid/view-model');

describe('vdlx-datagrid', () => {

    it('calls VDL to register as an extension', () => {
        expect(VDL).toBeCalledWith('vdlx-datagrid', {
            tag: 'vdlx-datagrid',
            attributes,
            createViewModel: viewModel,
            transform,
            modifiesDescendants: false
        });
    });

    it('fails', function () {
        expect(true).toBeFalsy();
    });

});
