/*
    vdlx-datagrid-column

    To be used as the direct child of <vdlx-datagrid>. <vdlx-datagrid-column may be used multiple times within its parent.
    One of these tags directly generates a column in the resulting Datagrid.

    This tag creates config to tell its parent how to populate the datagrid column.
 */



/*
    vdlx-datagrid-column attributes

    TODO do we need to add extra properties for the datagrid?
 */
var VDGCattributes = [
    {name: 'class'},
    {name: 'editable'},
    {name: 'editor-checked-value'},
    {name: 'editor-options'},
    {name: 'editor-options-include-empty'},
    {name: 'editor-options-set'},
    {name: 'editor-type'},
    {name: 'editor-unchecked-value'},
    {name: 'entity'},
    {name: 'format'},
    {name: 'heading'},
    {name: 'render'},
    {name: 'scenario'},
    {name: 'set'},
    {name: 'set-position'},
    {name: 'width'},
];

VDL('vdlx-datagrid-column', {
    attributes: VDGCattributes,
    createViewModel: function(params, componentInfo) {

    },
    transform: function(element, attributes, api) {
        let builder = api.getComponentParamsBuilder();
        VDGCattributes.forEach((attr) => {
            debugger;
            builder.addParam(_.camelCase(attr.name), attr, !attr.isString);
        })
    }
});