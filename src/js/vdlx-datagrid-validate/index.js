import VDGValidateAttributes from './attributes';
import transform from './transform';
import viewModel from './view-model';

VDL('vdlx-datagrid-validate', {
    tag: 'vdlx-datagrid-validate',

    attributes: VDGValidateAttributes,

    doc: {
        description:
            'Add a validation rule to a <code>&lt;vdlx-datagrid-column&gt;</code> element.' +
            ' You can declare multiple <code>&lt;vdl-validate&gt;</code> rules within a' +
            ' <code>&lt;vdlx-datagrid-column&gt;</code> and they will all be applied. Each rule can specify whether the field is allowed to save data if that rule' +
            ' fails (this is soft validation). The "pass" attribute defines the expression that is called every time the field or autocolumn' +
            ' changes. The expression is automatically given the variables: "entityName", "value", "indices" and "rowData" (if used with vdlx-datagrid). "entityName" is the' +
            ' name of the entity bound to the field, "value" is the current value being input, "indices" is an array of indices' +
            ' if the field is bound to an array element and rowData is an array containing indices and values of the current row.',
        descriptionAsHtml: true,

        elementContents: {
            description:
                'Text content of the element is used as the message to display when attempting to save and validation fails'
        },

        example:
            '' +
            '<vdlx-datagrid>\n' +
            '  <vdlx-datagrid-column entity="FactoryDemand">\n' +
            '    <vdl-validate pass="=value >= scenario.entities.SupportLevel.value" allow-save="=scenario.entities.CanSave.value">\n' +
            '      FactoryDemand should be greater than or equal to SupportLevel\n' +
            '    </vdl-validate>\n' +
            '  </vdlx-datagrid-column>\n' +
            '</vdlx-datagrid>'
    },

    requiredParent: ['vdlx-datagrid-column'],

    createViewModel: viewModel,

    transform: transform
});
