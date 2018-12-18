import Datagrid from './datagrid';
import { withDeepEquals } from './ko-utils';

const DEFAULT_GRID_PAGE_SIZE = 15;

function parseIntOrKeep (val) {
    var result = _.parseInt(val);
    if (_.isNaN(result)) {
        return val;
    }
    return result;
}

function isNullOrUndefined (val) {
    return _.isNull(val) || _.isUndefined(val);
}

const stripEmpties = _.partialRight(_.pick, _.flow(_.identity, _.negate(isNullOrUndefined)));

const getTableOptions = (params) => () => {
    var overrides = stripEmpties({
        paging: params.pageMode,
        pageLength: params.pageSize,
        searching: params.showFilter,
        columnFilter: params.columnFilter,
    });

    var gridOptions = {
        tableId: params.tableId,
        addRemoveRow: params.addRemoveRow,
        selectionAndNavigation: params.selectionNavigation,
        overrides: overrides,
        onError: _.bindKey(self, '_wrapAlert'),
        alwaysShowSelection: params.alwaysShowSelection,
        gridHeight: params.gridHeight,
        gridData: params.gridData,
        paginationSize: params.pageSize || DEFAULT_GRID_PAGE_SIZE
    };

    var pageMode = params['pageMode'];

    if (pageMode === 'paged') {
        gridOptions.pagination = 'local';
        gridOptions.paginationElement = $('.hidden-footer-toolbar').get(0); // hide the built-in paginator
    } else if (!pageMode || pageMode === 'none') {
        
    }

    if (_.isFunction(params.rowFilter)) {
        gridOptions.rowFilter = params.rowFilter;
    }

    gridOptions = stripEmpties(gridOptions);

    if (!_.isUndefined(params.modifier)) {
        if (_.isFunction(params.modifier)) {
            // Pass cloned options so they cannot modify the original table options object
            var modifiedTableOptions = params.modifier(_.cloneDeep(gridOptions));
            if (_.isPlainObject(modifiedTableOptions)) {
                gridOptions = modifiedTableOptions;
            }
        } else {
            // console.error('vdl-table (' + self.tableId + '): "modifier" attribute must be a function.');
        }
    }

    return gridOptions;
};

/**
 * VDL Extensions callback.
 *
 * It is this functions responsibility to create the ViewModel that supplies data and behaviour to the <vdlx-datagrid> UI template.
 *
 * @param {object} params - an object where each property is a static or dynamic runtime value for this VDL extension.
 * @param {object} componentInfo - An object containing info describing the component.
 * @param {HTMLElement} componentInfo.element the DOM node for this instance of the VDL extension.
 */
export default function createViewModel(params, componentInfo) {
    // Create the ViewModel object
    var vm = {};

    // Strip off the 'px' units if present.
    if (params.width) {
        vm.tableWidth = params.width.replace('px', '');
    }

    if(!!params.class) {
        $(componentInfo.element).find('.vdlx-datagrid').addClass(params.class);
    }

    const element = componentInfo.element;
    const defaultScenario = params.scenarioId || 0;

    const tableId = _.get(params, 'tableId', _.uniqueId('vdlx-datagrid-'));
    params.tableId = tableId;

    const $element = $(element);
    /*
    Create the DIV placeholder to attach Tabulator component to. 
     */
    const $tableDiv = $('<div/>');
    $tableDiv.attr('id', tableId);
    $tableDiv.addClass('vdlx-datagrid table-striped table-bordered table-condensed');
    $element.append($tableDiv);

    /*
    Create to DIV to hide the built-in pagination
     */
    const $hiddenFooter = $('<div class="hidden-footer-toolbar" style="display: none"/>');
    $element.append($hiddenFooter);

    /*
    Create the Footer toolbar with FICO pagination control.
     */
    const $footerToolBar = $('<div class="footer-toolbar"/>');
    $element.append($footerToolBar);
    /**
     * Wrap the options for the
     */
    const tableOptions$ = withDeepEquals(ko.pureComputed(getTableOptions(params)));
    const columnConfig$ = withDeepEquals(ko.observable({}));

    var datagrid = new Datagrid(element, tableOptions$, columnConfig$);

    function buildTable () {

        /*
        Collect the column information from the child VDL extensions (vdlx-datagrid-column)
         */
        const columnConfigs = $element
            .find('vdlx-datagrid-column')
            .map(function (idx, element) {
                return _.clone(element['autotableConfig']);
            });
        if(!columnConfigs.length) {
            return;
        }

        var entities = [];
        var indices = {};

        _.forEach(columnConfigs, function (configItem) {
            var scenarioNum = parseIntOrKeep(configItem.scenario || defaultScenario);
            if (_.isNumber(scenarioNum)) {
                if (scenarioNum < 0) {
                    // reject('Scenario index must be a positive integer.');
                }
            }
            configItem.scenario = scenarioNum;
            if (!!configItem.entity) {
                configItem.name = configItem.entity;
                delete configItem.entity;
                entities.push(_.omit(configItem, isNullOrUndefined));
            } else if (!!configItem.set) {
                if (!_.has(indices, [configItem.set])) {
                    indices[configItem.set] = [];
                }
                const indexList = indices[configItem.set];
                const cleanItem = _.omit(configItem, isNullOrUndefined);
                const setPosn = configItem.setPosition;
                if (setPosn == null) {
                    indexList.push(cleanItem);
                } else if (indexList[setPosn]) {
                    // reject('Table column for set "' + configItem.set + '" at position ' + setPosn
                    //     + ' specified more than once');
                } else {
                    indexList[setPosn] = cleanItem;
                    // if we have increased the length, then need to
                    // explicitly inserts null/undefined here, or some
                    // standard algorithms behave oddly. (E.g. _.map
                    // will count the missing items, but [].map won't)
                    _.range(indexList.length).forEach(function (j) {
                        if (!indexList[j]) {
                            indexList[j] = null;
                        }
                    });
                }
            } else {
                // reject('Unknown column type');
            }
        });

        var scenarioList = _(entities).filter(function (item) {
            return !isNullOrUndefined(item);
        }).map(function (item) {
            return ko.unwrap(item.scenario);
        }).uniq().sortBy().value();

        if (_.isEmpty(scenarioList) || _.isEmpty(entities)) {
            console.debug('vdl-table (' + params.tableId + '): Scenario list or table column configuration is empty, ignoring update');
        }

        columnConfig$({columnOptions: entities, indicesOptions: indices, scenarioList: scenarioList});
    }
    
    vm.tableUpdate = () => {
        _.defer(() => buildTable());
    };

    vm.tableValidate = function () {
        datagrid.validate();
    };

    vm.dispose = function () {
        datagrid.dispose();
    };

    buildTable();

    return vm;
}