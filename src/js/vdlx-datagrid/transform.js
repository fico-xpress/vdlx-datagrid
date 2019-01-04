/**
 * The transform function takes care of setting up/initialising a VDL extension.
 * @param {HTMLElement} element - The VDL DOM node.
 * @param attributes - A map of attributes by key.
 * @param api - Helper methods for VDL extension creation.
 */
export default function transform(element, attributes, api) {
    var paramsBuilder = api.getComponentParamsBuilder(element);
    var $element = $(element);

    var scenarioId = attributes['scenario'];
    if (scenarioId) {
        if (scenarioId.expression.isString) {
            var parsedNum = parseInt(scenarioId.rawValue);
            if (isNaN(parsedNum)) {
                paramsBuilder.addParam('scenarioId', scenarioId.rawValue);
            } else {
                if (parsedNum < 0) {
                    throw Error('If scenario-id is specifying an index it must be a positive integer.');
                }
                paramsBuilder.addParam('scenarioId', parsedNum);
            }
        } else {
            paramsBuilder.addParam('scenarioId', scenarioId.expression.value, true);
        }
    }

    var pageSize = attributes['page-size'];
    if (pageSize) {
        if (pageSize.expression.isString) {
            var pageSizeNum = parseInt(pageSize.rawValue);
            if (!isNaN(pageSizeNum)) {
                paramsBuilder.addParam('pageSize', pageSizeNum);
            }
        } else {
            paramsBuilder.addParam('pageSize', pageSize.expression.value, true);
        }
    }

    var pageMode = attributes['page-mode'];
    if (pageMode && pageMode.rawValue === 'paged') {
        paramsBuilder.addParam('pageMode', pageMode.rawValue);
    } else {
        paramsBuilder.addParam('pageMode', 'scrolling');
        $(element).addClass('scrolling');
    }

    // TODO No table search in vdlx-datagrid
    // var showFilter = attributes['show-filter'];
    // if (showFilter) {
    //     paramsBuilder.addParam('showFilter', showFilter.rawValue === 'true');
    // }

    var columnFilter = attributes['column-filter'];
    if (columnFilter) {
        paramsBuilder.addParam('columnFilter', columnFilter.rawValue === 'true');
    }

    var addRemoveRow = attributes['add-remove-row'];
    if (addRemoveRow) {
        if (addRemoveRow.rawValue === 'true') {
            paramsBuilder.addParam('addRemoveRow', true);
        } else if (addRemoveRow.rawValue === 'addrow-autoinc') {
            paramsBuilder.addParam('addRemoveRow', 'addrow-autoinc');
        }
    }

    // TODO row selection?
    // var selectionNavigation = attributes['selection-navigation'];
    // if (selectionNavigation && selectionNavigation.rawValue === 'false') {
    //     paramsBuilder.addParam('selectionNavigation', false);
    // }

    var tableIdAttr = attributes['id'];
    if (tableIdAttr) {
        $element.attr('id', null);
        paramsBuilder.addParam('tableId', tableIdAttr.rawValue);
    }

    var width = attributes['width'];
    if (width) {
        paramsBuilder.addParam('width', width.rawValue);
    }

    // TODO state saving?
    // var saveState = attributes['save-state'];
    // if (saveState && saveState.rawValue === 'false') {
    //     paramsBuilder.addParam('saveState', false);
    // }

    var modifier = attributes['modifier'];
    if (modifier) {
        if (modifier.expression.isString) {
            throw Error('The vdl-table modifier attribute must be supplied as an expression');
        }
        paramsBuilder.addParam('modifier', modifier.expression.value, true);
    }

    var klass = attributes['class'];
    if (klass) {
        $element.removeAttr('class');
        paramsBuilder.addParam('class', klass.rawValue);
    }

    var alwaysShowSelection = attributes['always-show-selection'];
    if (alwaysShowSelection && (alwaysShowSelection.rawValue.toUpperCase() === 'TRUE')) {
        paramsBuilder.addParam('alwaysShowSelection', true);
    }

    var rowFilter = attributes['row-filter'];
    if (rowFilter) {
        if (rowFilter.expression.isString) {
            throw Error('The vdl-table "row-filter" attribute must be supplied as an expression');
        }

        paramsBuilder.addFunctionOrExpressionParam('rowFilter', rowFilter.expression.value, ['rowData', 'indices']);
    }

    // TODO temporary data
    var gridData = attributes['grid-data'];
    if (gridData) {
        paramsBuilder.addParam('gridData', gridData.expression.value, true);
    }

    var gridHeight = attributes['height'];
    if (gridHeight) {
        if (gridHeight.expression.isString) {
            paramsBuilder.addParam('gridHeight', gridHeight.rawValue, false);
        } else {
            paramsBuilder.addParam('gridHeight', gridHeight.expression.value, true);
        }
    }

}
