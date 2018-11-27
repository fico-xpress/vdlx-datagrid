function isArrayEntity(entity) {
    return entity.getType() === 'ARRAY';
}

function isSetEntity(entity) {
    return entity.getType() === 'SET';
}

function adapt(root, obj, result) {
    let keys = Object.keys(obj); // ["1"]
    keys.forEach(key => {
        let val = obj[key];
        // console.log(root, key, val);
        if(typeof val === 'object') {
            adapt(root.concat(key), val, result);
        } else {
            result.push({key: root.concat(key), value: val});
        }
    });
}

function adaptValues(obj, result) {
    let keys = Object.keys(obj); // ["1"]
    keys.forEach(key => {
        let val = obj[key];
        // console.log(root, key, val);
        if(typeof val === 'object') {
            adaptValues(val, result);
        } else {
            result.push(val); //{key: root.concat(key), value: val}
        }
    });
}

VDL('vdlx-datagrid-provider', {
    tag: 'vdlx-datagrid-provider',
    attributes: ['columns'],
    requiredParent: 'vdlx-datagrid',
    createViewModel: function (params, componentInfo) {
        var vm = {};
        // debugger;

        var columns = params.columns;
        var arrayNames = _.filter(_.map(columns, 'entity'), _.identity);
        var setNames = _.filter(_.map(columns, 'set'), _.identity);
        var entityNames = _.union(arrayNames, setNames);
        var allColumnNames = _.map(columns, function (col) {
            return col.entity || col.set || col.field;
        });

        var view = insight.getView();
        var project = view.getProject();
        var modelSchema = project.getModelSchema();

        var modelEntities = _.map(entityNames, function (entityName) {
            return modelSchema.getEntity(entityName);
        });
        var indexSets = _.map(_.filter(modelEntities, isArrayEntity), function (modelEntity) {
            return modelEntity.getIndexSets();
        });
        if(indexSets.length > 1) {
            var noExtraIndices = _.difference.apply(undefined, indexSets);
            var allIndices = _.uniq(_.map(indexSets, function (indexSet) {
                return indexSet.length
            }));
            if (noExtraIndices.length || allIndices.length > 1) {
                // debugger;
                throw Error('Index sets don\'t match for entities ' + indexSets.join(', '));
            }
        }

        _.each(modelEntities, function (modelEntity) {
            var entityName = modelEntity.getName();
            var col = _.find(columns, function (acol) {
                return (acol.entity === entityName) || (acol.set === entityName);
            });
            if (col) {
                if (isSetEntity(modelEntity)) {
                    col.type = 'SET';
                    col.elementType = modelEntity.getElementType();
                } else if (isArrayEntity(modelEntity)) {
                    col.type = 'ARRAY';
                    col.elementType = modelEntity.getElementType();
                } else {
                    col.type = 'OTHER';
                }
            }
        });

        params.addColumnConfig(columns);

        console.time('+++TIME vdlx-datagrid DATA');
        view
            .withFirstScenario()
            .withEntities(_.union(arrayNames, setNames))
            .notify(function (scenario) {
                // debugger;
                console.timeEnd('+++TIME vdlx-datagrid DATA');

                var setData, rowKeys, ids = [];
                var arrays = _.map(modelEntities, function (entity) {
                    if (isArrayEntity(entity)) {
                        var t = scenario.getArray(entity.getName());
                        if (!setData) {
                            // debugger;
                            // var tLabel = '+++TIME firstEntityDataObj';
                            // console.time(tLabel);
                            // var firstEntityDataObj = t.toObjectArray();
                            // console.timeEnd(tLabel);

                            tLabel = '+++TIME firstEntityDataObj';
                            console.time(tLabel);
                            var firstEntityDataObj = [];
                            adapt([], t._elementData, firstEntityDataObj);
                            console.timeEnd(tLabel);

                            rowKeys = _.map(firstEntityDataObj, 'key');
                            ids = _.map(rowKeys, function (ks) {
                                return ks.join(',');
                            });
                            var sets = [];
                            var num = rowKeys[0].length;
                            for(var i = 0; i < num; i++) {
                                var newSet = [];
                                for(j = 0; j < rowKeys.length; j++) {
                                    newSet.push(rowKeys[j].shift());
                                }
                                sets.push(newSet);
                            }
                            setData = _.zipObject(_.first(indexSets), sets);
                        }
                        return t;
                    } else if (isSetEntity(entity)) {
                        // return scenario.getSet(entity.getName());
                    } else {
                        throw Error('Unknown column type');
                    }
                });
                var timeLabel = '+++TIME allArrayData vdlx-datagrid-provider 101-114';
                console.time(timeLabel);
                var allArrayData = [];
                var col;
                for(var i = 0; i < columns.length; i++) {
                    col = columns[i];
                    if(col.set) {
                        allArrayData.push(setData[col.set]);
                    }
                    if(col.entity) {
                        var arr = scenario.getArray(col.entity);
                        let arrData = [];
                        adaptValues(arr._elementData, arrData);
                        allArrayData.push(arrData);
                    }
                }
                console.timeEnd(timeLabel);
                allArrayData.push(ids);

                // debugger;
                params.addColumnData(allArrayData);
            });
        return vm;
    },
    transform: function (element, attributes, api) {
        var paramsBuilder = api
            .getComponentParamsBuilder(element)
            .addParentCallbackParam('addColumnConfig')
            .addParentCallbackParam('addColumnData')
            .addRawOrExpressionParam('columns', attributes['columns']);
    }
});