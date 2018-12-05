export default [
    {
        name: 'id',
        description:
        'Specify an element id for the table. Useful if you later want to target the table using a selector. ' +
        'If not given then an id will be generated.'
    },
    {
        name: 'scenario',
        description:
        'The default scenario to use for fetching data in the table. This can be overridden per column but the default ' +
        'will be used when a column does not specify a particular scenario and the index sets will be fetched from the default scenario.',
        acceptsExpression: true
    },
    {
        name: 'page-size',
        description: 'The number of rows to show per-page in paged mode. Defaults to 50.',
        acceptsExpression: true
    },
    {
        name: 'page-mode',
        description: 'By default the table will show all rows. Set this attribute to "paged" to enable table pagination.'
    },
    {
        name: 'height',
        description: 'Table height',
        acceptsExpression: true
    },
    {
        name: 'show-filter',
        description:
            'Set this to "true" to enable the table filter. This will show a single input above the table to filter across all table cells.'
    },
    {
        name: 'column-filter',
        description:
            'Set this to "true" to enable the column filters. This will show a header row with filter inputs for each column.'
    },
    {
        name: 'add-remove-row',
        description:
        'Setting this will show the add-remove row buttons at the bottom of the table. Set to "true" ' +
        'to prompt for index selection on row add. Set to "addrow-autoinc" will switch the behaviour to allow new ' +
        'index values to be created, incrementing from the highest value in the set(s).'
    },
    {
        name: 'selection-navigation',
        description:
        'Enable/disable table navigation, selection and clipboard features. Set to "false" to disable ' +
        'these features. Defaults to true.'
    },
    {
        name: 'modifier',
        description:
        'Table modifier function. Will be called after the table configuration ' +
        'has been built. Provides a way to change the configuration before the table is rendered. Must ' +
        'be an expression that resolves to a function. Takes the table configuration object and ' +
        'should return the modified configuration. If an object is not returned then the table will be unaffected.',
        acceptsExpression: true
    },
    {
        name: 'width',
        description:
        'Set the table to a fixed width, in pixels. Accepts an integer value. ' +
        'If set to the string "custom" then the table width is calculated by adding up all the widths of the columns in the table. ' +
        "If a column doesn't have a width specified then it is given a default value of 100px.",
        acceptsExpression: false
    },
    {
        name: 'class',
        description: 'Space-separated list of the classes of the element.',
        acceptsExpression: false
    },
    {
        name: 'always-show-selection',
        description:
            'Whether to display selection on inactive tables. Set to "true" to keep selection on a table when it becomes inactive. Defaults to false.',
        acceptsExpression: false
    },
    {
        name: 'row-filter',
        description:
        'Expression to be used for filtering the rows of a <vdl-table>. This must be an expression and ' +
        'should resolve to either a function or a boolean value. If a function it will be executed when table updates. ' +
        'The function will have the following signature (rowData, indices) and should return a boolean.',
        acceptsExpression: true,
        required: false,
        expressionVars: [
            {
                name: 'rowData',
                type: 'Array.<(string|boolean|number)>',
                description: 'Data for all row cells'
            },
            {
                name: 'indices',
                type: 'Array.<(string|boolean|number)>',
                description: 'Data for the index columns of the row'
            }
        ]
    },
    {
        name: 'save-state',
        description:
        'Set this to "false" to disable table state saving. By default table state is stored in the ' +
        "user's browser session so that user settings (e.g. page, sorting and search) are preserved if table data " +
        'is reloaded. Defaults to true.',
        acceptsExpression: false,
        required: false
    },
    {
        name: 'grid-data',
        acceptsExpression: true
    }
];