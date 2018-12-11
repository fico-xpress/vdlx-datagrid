
export const getRowData = (columnsIds) => (data) => _.map(columnsIds, _.propertyOf(data));