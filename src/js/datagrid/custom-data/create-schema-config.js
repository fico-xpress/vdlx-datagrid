import _ from 'lodash';

/**
 * The function recursively iterates through nested objects and converts them to tabulator objects.
 *
 * @param {{Object}} root - json schema object
 * @param {{string}} dataTreeChildField - The default name of the children's properties
 * @returns {*[]} - Returns Array of objects.
 */
const constructTabulator = (root, dataTreeChildField = '_children') => {

    if (!root){
        throw Error('properties attribute must be defined')
    }
    let row = []

    for (let key in root) {
        let type = root[key]?.type;
        if (type === 'object') {
            let childObj = {name: key, type:''};
            let childProps;
            if (root[key] && root[key].properties){
                childProps = root[key].properties
            }
            childObj[dataTreeChildField] = constructTabulator(childProps);
            row.push({...childObj, ...childProps[key]});
        } else {
            row.push({name: key, type: type, ...root[key]});
        }
    }

    return row;
}

/**
 * This function creates a tabulatorJs object based on the schema definition. It throws an error if there is no schema attribute.
 *
 * @param root - JSON schema data
 * @param dataTreeChildField - Default name for the children properties
 * @returns {*[]} - Returns Array of objects.
 */
const generateTabulatorData = (root, dataTreeChildField = '_children') => {

    if (!_.size(root)){
        return [];
    }

    let tabulatorData;

    if (root['$schema']) {
        tabulatorData = constructTabulator(root.properties, dataTreeChildField);
    } else {
        throw new Error('JSON schema should contain draft version');
    }
    return tabulatorData;
}



/**
 * This function takes js object as input and returns unique fields present in the object.
 *
 * @param root - js object.
 * @param uniqueKeys - Contains unique properties of the object.
 * @returns {any[]} - List of unique object.
 */

function getObjectKeys(root, uniqueKeys = new Set()) {

    _.forEach(root, (value, key) => {
        if (_.isObject(root[key]) && !_.isArray(root[key])) {
            getObjectKeys(root[key], uniqueKeys);
        } else {
            if (!uniqueKeys.has(key)) {
                uniqueKeys.add(key);
            }
        }
    });

    return Array.from(uniqueKeys);
}

/**
 * This function takes json schema as input and generates column definition for tabulator.
 * When converting a json-schema to tabulator, some internal json-schema keywords will be ignored
 * by default.  The keywords are not displayed if they satisfy any of the following condition:
 * - if the keyword starts with an underscore ('_')
 * - if the keyword starts with a dollar signs ('$')
 * - if the keyword is 'id', 'required'.
 * The following keywords whenever displayed are always read only:
 * - id
 * - name
 *
 * @param {{Object}} root - json schema object.
 * @param {{Object}} options - This object can contain different configurations to generate column-definition.
 * @property {{Array}} includes - (optional) An array containing a list of json-schema keywords and custom keywords to
 * be used as columns.
 * @property {{Array}} excludes - (optional) An array containing a list of json-schema keywords and customer keywords to
 * be ignored when rendering the table.
 * @property {{Array}} writeOnly - (optional) An array containing a list of keywords that will be displayed as editable column.
 * @property {{Array}} showAll - {optional} A boolean that is equal to true if all keywords, including the internal keywords.
 * @property {{Array}} order - (optional) Array represent the display order of columns.
 * @returns {[{field: string, title: string}]}
 */

function generateColDefinitions(root, options = {}) {

    const includes = options.includes || [];
    const excludes = options.excludes || ['id', 'required'];
    const writeOnly = options.writeOnly || [];
    const showAll = options.showAll || false;
    const order = options.order || ['id', 'type'];

    let uniqueKeys = getObjectKeys(root);
    let columnNames = uniqueKeys;

    if (!showAll) {
        // Removing fields if it starts with $ or _
        columnNames = _.filter(uniqueKeys, element => !(_.startsWith(element, '$') || _.startsWith(element, '_')));
        // Adding custom fields to set.
        columnNames = _.union(columnNames, includes);
        // Excluding custom fields.
        columnNames = _.filter(columnNames, element => !(_.includes(excludes, element)));
    }
    // Default Sorting order
    columnNames = _.sortBy(columnNames, function (element) {
        return _.indexOf(order, element) === -1 ? Number.MAX_SAFE_INTEGER : _.indexOf(order, element);
    });
    // By default, first column should be name.
    let columnDefinition = [{
        title: 'Name',
        field: 'name'
    }];
    for (let field of columnNames) {
        let columnObj = {
            title: _.capitalize(field),
            field: field,
            editable: _.includes(writeOnly, field)
        };

        columnDefinition.push(columnObj);
    }
    return columnDefinition;
}

/**
 * This functions takes grid options and json schema as input and returns a object contains tabulator data and schema
 * definition.
 *
 * @param gridOptions - Tabulator options
 * @param data - JSON schema data
 * @returns {{data: *[], cols: {field: string, title: string}[]}}
 */
export const createSchemaConfig = (gridOptions, data) => {
    const tabulatorData = generateTabulatorData(data, gridOptions.dataTreeChildField);
    const columnDefinition = generateColDefinitions(data)

    return {
        data: tabulatorData,
        cols: columnDefinition,
    };

}
