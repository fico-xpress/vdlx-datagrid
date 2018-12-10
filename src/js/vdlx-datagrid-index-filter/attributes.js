
export default [
    {
        name: 'set',
        description: 'Name of the set entity to filter out of the indices for the column.',
        required: true
    },
    {
        name: 'set-position',
        description:
            'Index (zero-based) of occurrence of that index set in the index tuple for the array. Defaults to zero.'
    },
    {
        name: 'value',
        description: 'Single value to fix the indices to.',
        acceptsExpression: true,
        required: true
    }
];