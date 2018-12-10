const DataUtils = insightModules.load('utils/data-utils');

export default (element, attributes, api) => {
    var $element = $(element);
    var entityName = $element
        .closest('[entity]')
        .attr('entity');

    if (!entityName) {
        throw Error('<vdlx-datagrid-index-filter> must be contained within a <vdlx-datagrid-column> that defines an "entity".');
    }
    const parentArray = api.getModelEntityByName(entityName);
    if (!parentArray) {
        throw Error('Entity "' + entityName + '" does not exist in the model schema.');
    }
    const indexSetNames = parentArray.getIndexSets();
    if (!indexSetNames) {
        throw Error('Entity "' + entityName + '" must be an array.');
    }
    const indexSetNameAndPosns = DataUtils.getSetNamesAndPosns(indexSetNames);

    var setName = attributes['set'].rawValue;
    var setPosition = _.get(attributes, ['set-position', 'rawValue'], 0);
    if (!/^\d+$/.test(setPosition)) {
        throw Error('Invalid set-position: ' + setPosition);
    } else {
        setPosition = +setPosition;
    }

    var setEntity = api.getModelEntityByName(setName);
    if (!setEntity) {
        throw Error('Entity "' + setName + '" not found in the model. Cannot set index filter.');
    }
    if (!_.find(indexSetNameAndPosns, { name: setName, position: setPosition })) {
        if (_.has(attributes, 'set-position')) {
            throw Error('Invalid index set name/position combination ("' + setName + '",' + setPosition + ') for array ' + entityName);
        } else {
            throw Error('Invalid index set "' + setName + '" for array ' + entityName);
        }
    }

    api.getComponentParamsBuilder(element)
        .addParam('setName', setName)
        .addParam('setPosition', setPosition)
        .addRawOrExpressionParam('value', attributes.value)
        .addParentCallbackParam('filterUpdate')
        .addParentCallbackParam('filterRemove');
}