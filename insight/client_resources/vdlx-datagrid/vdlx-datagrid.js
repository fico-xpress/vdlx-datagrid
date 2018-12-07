// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../css/vdlx-datagrid.scss":[function(require,module,exports) {

},{}],"vdlx-datagrid/attributes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = [{
  name: 'id',
  description: 'Specify an element id for the table. Useful if you later want to target the table using a selector. ' + 'If not given then an id will be generated.'
}, {
  name: 'scenario',
  description: 'The default scenario to use for fetching data in the table. This can be overridden per column but the default ' + 'will be used when a column does not specify a particular scenario and the index sets will be fetched from the default scenario.',
  acceptsExpression: true
}, {
  name: 'page-size',
  description: 'The number of rows to show per-page in paged mode. Defaults to 50.',
  acceptsExpression: true
}, {
  name: 'page-mode',
  description: 'By default the table will show all rows. Set this attribute to "paged" to enable table pagination.'
}, {
  name: 'height',
  description: 'Table height',
  acceptsExpression: true
}, {
  name: 'show-filter',
  description: 'Set this to "true" to enable the table filter. This will show a single input above the table to filter across all table cells.'
}, {
  name: 'column-filter',
  description: 'Set this to "true" to enable the column filters. This will show a header row with filter inputs for each column.'
}, {
  name: 'add-remove-row',
  description: 'Setting this will show the add-remove row buttons at the bottom of the table. Set to "true" ' + 'to prompt for index selection on row add. Set to "addrow-autoinc" will switch the behaviour to allow new ' + 'index values to be created, incrementing from the highest value in the set(s).'
}, {
  name: 'selection-navigation',
  description: 'Enable/disable table navigation, selection and clipboard features. Set to "false" to disable ' + 'these features. Defaults to true.'
}, {
  name: 'modifier',
  description: 'Table modifier function. Will be called after the table configuration ' + 'has been built. Provides a way to change the configuration before the table is rendered. Must ' + 'be an expression that resolves to a function. Takes the table configuration object and ' + 'should return the modified configuration. If an object is not returned then the table will be unaffected.',
  acceptsExpression: true
}, {
  name: 'width',
  description: 'Set the table to a fixed width, in pixels. Accepts an integer value. ' + 'If set to the string "custom" then the table width is calculated by adding up all the widths of the columns in the table. ' + "If a column doesn't have a width specified then it is given a default value of 100px.",
  acceptsExpression: false
}, {
  name: 'class',
  description: 'Space-separated list of the classes of the element.',
  acceptsExpression: false
}, {
  name: 'always-show-selection',
  description: 'Whether to display selection on inactive tables. Set to "true" to keep selection on a table when it becomes inactive. Defaults to false.',
  acceptsExpression: false
}, {
  name: 'row-filter',
  description: 'Expression to be used for filtering the rows of a <vdl-table>. This must be an expression and ' + 'should resolve to either a function or a boolean value. If a function it will be executed when table updates. ' + 'The function will have the following signature (rowData, indices) and should return a boolean.',
  acceptsExpression: true,
  required: false,
  expressionVars: [{
    name: 'rowData',
    type: 'Array.<(string|boolean|number)>',
    description: 'Data for all row cells'
  }, {
    name: 'indices',
    type: 'Array.<(string|boolean|number)>',
    description: 'Data for the index columns of the row'
  }]
}, {
  name: 'save-state',
  description: 'Set this to "false" to disable table state saving. By default table state is stored in the ' + "user's browser session so that user settings (e.g. page, sorting and search) are preserved if table data " + 'is reloaded. Defaults to true.',
  acceptsExpression: false,
  required: false
}, {
  name: 'grid-data',
  acceptsExpression: true
}];
exports.default = _default;
},{}],"vdlx-datagrid/transform.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(element, attributes, api) {
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
  } // TODO No table search in vdlx-datagrid
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
  } // TODO row selection?
  // var selectionNavigation = attributes['selection-navigation'];
  // if (selectionNavigation && selectionNavigation.rawValue === 'false') {
  //     paramsBuilder.addParam('selectionNavigation', false);
  // }


  var tableId = attributes['id'];

  if (tableId) {
    $element.attr('id', null);
    paramsBuilder.addParam('tableId', tableId.rawValue);
  }

  var width = attributes['width'];

  if (width) {
    paramsBuilder.addParam('width', width.rawValue);
  } // TODO state saving?
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
  } // TODO any way to achieve this? Is it needed?
  // var alwaysShowSelection = attributes['always-show-selection'];
  // if (alwaysShowSelection && (alwaysShowSelection.rawValue.toUpperCase() === 'TRUE')) {
  //     paramsBuilder.addParam('alwaysShowSelection', true);
  // }


  var rowFilter = attributes['row-filter'];

  if (rowFilter) {
    if (rowFilter.expression.isString) {
      throw Error('The vdl-table "row-filter" attribute must be supplied as an expression');
    }

    paramsBuilder.addFunctionOrExpressionParam('rowFilter', rowFilter.expression.value, ['rowData', 'indices']);
  } // TODO temporary data


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

  var $tableDiv = $('<div/>');
  $tableDiv.attr('id', tableId.rawValue);
  $tableDiv.addClass('table-striped table-bordered table-condensed');
  $element.append($tableDiv);
}
},{}],"vdlx-datagrid/data-transform.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getDisplayIndices = exports.getAllColumnIndices = void 0;
var DataUtils = insightModules.load('utils/data-utils');
var createDenseData = insightModules.load('components/table/create-dense-data');

var getAllColumnIndices = _.curry(function (schema, columnOptions) {
  return _.map(columnOptions, function (option) {
    return schema.getEntity(option.name).getIndexSets();
  });
}, 2);
/**
 * @typedef {{name: string, position: number}} SetNameAndPosition 
 */

/** @returns {SetNameAndPosition[]} */


exports.getAllColumnIndices = getAllColumnIndices;

var getDisplayIndices = function getDisplayIndices(columnIndices, columnOptions) {
  var setCount = {};
  var numColumns = columnIndices.length;

  var _loop = function _loop() {
    var indices = columnIndices[i],
        options = columnOptions[i];
    var setPosns = DataUtils.getIndexPosns(indices);
    indices.forEach(function (setName, i) {
      var setPosn = setPosns[i];

      if (DataUtils.getFilterValue(options.filters, setName, setPosn) == null) {
        // i.e. if there is no filter, then this index is to be used
        var key = {
          name: setName,
          position: setPosn
        },
            keyJson = JSON.stringify(key);
        setCount[keyJson] = (setCount[keyJson] || 0) + 1;
      }
    });
  };

  for (var i = 0; i < numColumns; i++) {
    _loop();
  }

  return _(setCount).pick(function (count) {
    return count === numColumns;
  }).keys().map(function (k) {
    return JSON.parse(k);
  }).value();
};

exports.getDisplayIndices = getDisplayIndices;

var generateCompositeKey = function generateCompositeKey(setValues, setNameAndPosns, arrayIndices, arrayOptions) {
  var setPosns = DataUtils.getIndexPosns(arrayIndices);
  return arrayIndices.map(function (setName, i) {
    var setPosn = setPosns[i];

    var setIndex = _.findIndex(setNameAndPosns, {
      name: setName,
      position: setPosn
    });

    var filterValue = DataUtils.getFilterValue(arrayOptions.filters, setName, setPosn);

    if (setIndex !== -1) {
      return setValues[setIndex];
    } else if (filterValue != null) {
      return filterValue;
    } else {
      throw Error('Cannot generate table with incomplete index configuration. Missing indices: ' + setName + ' for entity: ' + arrayOptions.name);
    }
  });
};

var _default = function _default(allColumnIndices, columnOptions, setNamePosnsAndOptions, scenariosData) {
  var defaultScenario = scenariosData.defaultScenario;

  var indexScenarios = _.uniq(_.map(_.map(columnOptions, 'id'), function (id) {
    return _.get(scenariosData.scenarios, id, defaultScenario);
  }));

  var arrayIds = _.map(columnOptions, 'id');

  var setIds = _.map(setNamePosnsAndOptions, 'options.id');

  var arrays = _.map(columnOptions, function (column) {
    return _.get(scenariosData.scenarios, column.id, defaultScenario).getArray(column.name);
  });

  var sets = _.map(setNamePosnsAndOptions, function (setNameAndPosn) {
    return _(indexScenarios).map(function (scenario) {
      return scenario.getSet(setNameAndPosn.name);
    }).flatten().uniq().value();
  });

  var createRow = _.partial(_.zipObject, setIds.concat(arrayIds));

  return _.map(createDenseData(sets, arrays, setNamePosnsAndOptions, allColumnIndices, columnOptions, generateCompositeKey), createRow);
};

exports.default = _default;
},{}],"vdlx-datagrid/ko-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onSubscriptionDispose = onSubscriptionDispose;
exports.withDeepEquals = exports.withEqualityComparer = exports.onSubscribe = exports.startWith = exports.filter = exports.combineMap = exports.combineLatest = exports.map = void 0;

/** @type {KnockoutStatic} */
ko;

var map = _.curry(function (f, observable) {
  return ko.pureComputed(function () {
    return f(ko.unwrap(observable));
  });
}, 2);

exports.map = map;

var combineLatest = function combineLatest(observables) {
  return ko.pureComputed(function () {
    return _.map([].concat(observables), function (observable) {
      return ko.unwrap(observable);
    });
  });
};
/**
 * @param {Function} f
 * @param {...KnockoutObservable} observables
 * @returns {KnockoutObservable}
*/


exports.combineLatest = combineLatest;

var combineMap = _.curry(function (f) {
  for (var _len = arguments.length, observables = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    observables[_key - 1] = arguments[_key];
  }

  return map(f, combineLatest.apply(void 0, observables));
}, 2);

exports.combineMap = combineMap;

var filter = _.curry(function (predicate, observable) {
  var previousValue = ko.unwrap(observable);
  return map(function (val) {
    if (predicate(val)) {
      previousValue = val;
      return val;
    }

    return previousValue;
  }, observable);
}, 2);

exports.filter = filter;

var startWith = _.curry(function (value, o2) {
  var res = ko.observable(ko.unwrap(value));
  var anotherSubscription;
  return onSubscribe(function (subscription) {
    if (!anotherSubscription) {
      anotherSubscription = o2.subscribe(function (anotherValue) {
        return res(anotherValue);
      });
    }

    onSubscriptionDispose(function () {
      if (!!res.getSubscriptionsCount()) {
        anotherSubscription.dispose();
        anotherSubscription = null;
      }
    }, subscription);
  }, res);
}, 2);

exports.startWith = startWith;

var onSubscribe = _.curry(function (f, observable) {
  var subscribe = observable.subscribe;

  observable.subscribe = function () {
    var subscription = subscribe.apply(observable, arguments);
    f(subscription);
    return subscription;
  };

  return observable;
}, 2);

exports.onSubscribe = onSubscribe;

function onSubscriptionDispose(f, subscription) {
  var dispose = subscription.dispose;

  subscription.dispose = function () {
    dispose.apply(subscription, arguments);
    f();
  };

  return subscription;
}

var withEqualityComparer = _.curry(function (f, obs) {
  obs.equalityComparer = f;
  return obs;
}, 2);

exports.withEqualityComparer = withEqualityComparer;
var withDeepEquals = withEqualityComparer(_.isEqual);
exports.withDeepEquals = withDeepEquals;
},{}],"vdlx-datagrid/data-loader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koUtils = require("./ko-utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function findScenario(scenarios, identifier) {
  var result = null; // Find scenario by ID.

  scenarios.some(function (currentScenario) {
    if (currentScenario.getId() === identifier) {
      result = currentScenario;
      return true;
    }

    return false;
  });

  if (result) {
    return result;
  } // Find by position.


  scenarios.some(function (currentScenario) {
    if (currentScenario.getSelectionIndex() === identifier) {
      result = currentScenario;
      return true;
    }

    return false;
  });
  return result;
}

function getAutoTableEntities(columnOptions) {
  var modelSchema = insight.getView().getProject().getModelSchema();

  var entities = _.map(columnOptions, 'name'); // and index sets


  entities = entities.concat(_.flatten(_.map(entities, function (entity) {
    return modelSchema.getEntity(entity).getIndexSets();
  }))); // Also add entities from editor options set.

  entities = entities.concat(_.filter(_.map(columnOptions, 'editorOptionsSet'), _.identity));
  entities = _.uniq(entities);
  return entities.concat(_.filter(_.map(entities, function (entity) {
    return modelSchema.getEntity(entity).getLabelsEntity();
  }), _.identity));
}

function getScenarios(config, scenarios) {
  scenarios = [].concat(scenarios);
  var defaultScenario = _.isUndefined(config.scenario) ? scenarios[0] : findScenario(scenarios, config.scenario); // Bind a scenario per column - single table.

  var columnsAndScenarios = _.zipObject(_.filter(_.map(config.columnOptions, function (currentColumn) {
    return [currentColumn.id, findScenario(scenarios, currentColumn.scenario)];
  }), function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        columnId = _ref2[0],
        scenario = _ref2[1];

    return !!scenario;
  }));

  return {
    defaultScenario: defaultScenario,
    scenarios: columnsAndScenarios
  };
}
/**
 *
 * @param {*} config$
 * @returns {KnockoutObservable<{defaultScenario: Scenario, scenarios: Scenario[]}>}
 */


function withScenarioData(config$) {
  var hasSubscription = false;
  var scenarios$ = ko.observable([]);

  var scenarioData$ = _.compose((0, _koUtils.map)(function (configAndScenarios) {
    if (!configAndScenarios) {
      return undefined;
    }

    var _configAndScenarios = _slicedToArray(configAndScenarios, 2),
        config = _configAndScenarios[0],
        scenarios = _configAndScenarios[1];

    return getScenarios(config, scenarios);
  }), (0, _koUtils.filter)(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        config = _ref4[0],
        scenarios = _ref4[1];

    return !_.isEmpty(config) && !_.isEmpty(scenarios);
  }), _koUtils.combineLatest)([config$, scenarios$]);

  var scenarioObserverSubscription$ = ko.pureComputed(function () {
    var config = ko.unwrap(config$);

    if (!_.isEmpty(config.scenarioList) && !_.isEmpty(config.columnOptions)) {
      return insight.getView().withScenarios(config.scenarioList).withEntities(getAutoTableEntities(config.columnOptions)).notify(function (scenarios) {
        scenarios$(scenarios);
      }).start();
    }

    return undefined;
  });
  return (0, _koUtils.onSubscribe)(function (subscription) {
    var subscriptions = [];

    if (!hasSubscription) {
      subscriptions = [scenarioObserverSubscription$.subscribe(_.noop), scenarioObserverSubscription$.subscribe(function (oldScenarioObserver) {
        oldScenarioObserver && oldScenarioObserver.dispose();
      }, null, 'beforeChange')];
      hasSubscription = true;
    }

    (0, _koUtils.onSubscriptionDispose)(function () {
      hasSubscription = !!scenarioData$.getSubscriptionsCount();

      if (!hasSubscription) {
        _.each(subscriptions, function (sub) {
          return sub.dispose();
        });
      }
    }, subscription);
  }, scenarioData$);
}

;
var _default = withScenarioData;
exports.default = _default;
},{"./ko-utils":"vdlx-datagrid/ko-utils.js"}],"vdlx-datagrid/datagrid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dataTransform = _interopRequireWildcard(require("./data-transform"));

var _koUtils = require("./ko-utils");

var _dataLoader = _interopRequireDefault(require("./data-loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectOptions = insightModules.load('components/autotable-select-options');

var createTabulatorFactory = function createTabulatorFactory(selector) {
  return function (config) {
    return new Tabulator(selector, config);
  };
};

var someEmpty = function someEmpty(values) {
  return _.some(values, _.isEmpty);
};

var notSomeEmpty = _.negate(someEmpty);

var Datagrid = function Datagrid(options$, columnOptions$) {
  _classCallCheck(this, Datagrid);

  var schema = insight.getView().getProject().getModelSchema();

  var scenariosData$ = _.compose((0, _koUtils.filter)(function (v) {
    return v && v.defaultScenario;
  }), (0, _koUtils.startWith)(undefined), _dataLoader.default)(columnOptions$);

  var indicesOptions$ = (0, _koUtils.map)(_.property('indicesOptions'), columnOptions$);
  var entitiesOptions$ = (0, _koUtils.map)(_.property('columnOptions'), columnOptions$);
  var allColumnIndices$ = (0, _koUtils.map)((0, _dataTransform.getAllColumnIndices)(schema), entitiesOptions$);
  var setNameAndPosns$ = (0, _koUtils.combineMap)(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        columnIndices = _ref2[0],
        entitiesOptions = _ref2[1];

    return (0, _dataTransform.getDisplayIndices)(columnIndices, entitiesOptions);
  }, [allColumnIndices$, entitiesOptions$]);
  var setNamePosnsAndOptions$ = (0, _koUtils.combineMap)(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        setNameAndPosns = _ref4[0],
        indicesOptions = _ref4[1];

    return _.map(setNameAndPosns, function (setNameAndPosn) {
      return _objectSpread({}, setNameAndPosn, {
        options: _.get(indicesOptions, "".concat(setNameAndPosn.name, ".").concat(setNameAndPosn.position), {
          id: "".concat(setNameAndPosn.name, "_").concat(setNameAndPosn.position)
        })
      });
    });
  }, [setNameAndPosns$, indicesOptions$]);
  var allScenarios$ = (0, _koUtils.map)(function (scenariosData) {
    return scenariosData && _.uniq([scenariosData.defaultScenario].concat(_.values(scenariosData.scenarios)));
  }, scenariosData$);

  var indicesColumns$ = _.compose((0, _koUtils.map)(function (values) {
    var _values = _slicedToArray(values, 2),
        setNamePosnsAndOptions = _values[0],
        allScenarios = _values[1];

    return _.map(setNamePosnsAndOptions, function (setNameAndPosn) {
      var name = setNameAndPosn.name,
          options = setNameAndPosn.options;
      var entity = schema.getEntity(name);
      return {
        title: String(options.title || entity.getAbbreviation() || name),
        field: options.id,
        mutator: function mutator(value, data, type, params) {
          return SelectOptions.getLabel(schema, allScenarios, entity, value);
        }
      };
    });
  }), _koUtils.withDeepEquals, (0, _koUtils.filter)(notSomeEmpty), (0, _koUtils.startWith)([]), _koUtils.combineLatest)([setNamePosnsAndOptions$, allScenarios$]);

  var entitiesColumns$ = (0, _koUtils.map)(function (entitiesOptions) {
    return _.map(entitiesOptions, function (entityOptions) {
      var entity = schema.getEntity(entityOptions.name);
      return _.assign(entityOptions, {
        title: String(entityOptions.title || entity.getAbbreviation() || entityOptions.name),
        field: entityOptions.id
      });
    });
  }, entitiesOptions$);

  var columns$ = _.compose((0, _koUtils.map)(_.flatten), (0, _koUtils.filter)(notSomeEmpty), (0, _koUtils.startWith)([]), _koUtils.combineLatest)([indicesColumns$, entitiesColumns$]);

  var tabulatorFactory$ = (0, _koUtils.map)(function (options) {
    return options.tableId ? createTabulatorFactory("#".concat(options.tableId)) : _.noop;
  }, options$);
  var tabulatorOptions$ = (0, _koUtils.map)(function (options) {
    return {
      layout: 'fitColumns',
      placeholder: 'Waiting for data',
      groupStartOpen: false,
      ajaxLoader: true,
      columns: []
    };
  }, options$);
  var table$ = (0, _koUtils.combineMap)(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        factory = _ref6[0],
        options = _ref6[1];

    return factory(options);
  }, [tabulatorFactory$, tabulatorOptions$]);
  table$.subscribe(function (oldTable) {
    return oldTable && oldTable.destroy();
  }, null, 'beforeChange');

  var data$ = _.compose((0, _koUtils.map)(function (params) {
    return params && _dataTransform.default.apply(void 0, _toConsumableArray(params));
  }), (0, _koUtils.filter)(notSomeEmpty), (0, _koUtils.startWith)(undefined), _koUtils.combineLatest)([allColumnIndices$, entitiesColumns$, setNamePosnsAndOptions$, scenariosData$]);

  _.compose((0, _koUtils.map)(function (values) {
    if (!values) {
      return false;
    }

    var _values2 = _slicedToArray(values, 3),
        table = _values2[0],
        columns = _values2[1],
        data = _values2[2];

    table.setColumns(columns);
    return table.setData(data).then(function () {
      table.redraw();
    }).catch(function (err) {
      debugger;
    });
  }), (0, _koUtils.filter)(notSomeEmpty), (0, _koUtils.startWith)(undefined), _koUtils.combineLatest)([table$, columns$, data$]).subscribe(_.noop);
};

var _default = Datagrid;
exports.default = _default;
},{"./data-transform":"vdlx-datagrid/data-transform.js","./ko-utils":"vdlx-datagrid/ko-utils.js","./data-loader":"vdlx-datagrid/data-loader.js"}],"vdlx-datagrid/view-model.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _datagrid = _interopRequireDefault(require("./datagrid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COLUMN_UPDATE_DELAY = 100;

function parseIntOrKeep(val) {
  var result = _.parseInt(val);

  if (_.isNaN(result)) {
    return val;
  }

  return result;
}

function isNullOrUndefined(val) {
  return _.isNull(val) || _.isUndefined(val);
}

var stripEmpties = _.partialRight(_.pick, _.flow(_.identity, _.negate(isNullOrUndefined)));

var getTableOptions = function getTableOptions(params) {
  return function () {
    var overrides = stripEmpties({
      paging: params.pageMode,
      pageLength: params.pageSize,
      searching: params.showFilter,
      columnFilter: params.columnFilter
    });
    var tableOptions = {
      tableId: params.tableId,
      addRemoveRow: params.addRemoveRow,
      selectionAndNavigation: params.selectionNavigation,
      overrides: overrides,
      onError: _.bindKey(self, '_wrapAlert'),
      alwaysShowSelection: params.alwaysShowSelection,
      gridHeight: params.gridHeight,
      gridData: params.gridData
    };
    var pageMode = params['pageMode'];

    if (pageMode === 'paged') {
      tableOptions.pagination = 'local';
      tableOptions.paginationSize = params.pageSize || 15;
    } else if (!pageMode || pageMode === 'none') {
      tableOptions.height = false;
    }

    if (_.isFunction(params.rowFilter)) {
      tableOptions.rowFilter = params.rowFilter;
    }

    tableOptions = stripEmpties(tableOptions);

    if (!_.isUndefined(params.modifier)) {
      if (_.isFunction(params.modifier)) {
        // Pass cloned options so they cannot modify the original table options object
        var modifiedTableOptions = params.modifier(_.cloneDeep(tableOptions));

        if (_.isPlainObject(modifiedTableOptions)) {
          tableOptions = modifiedTableOptions;
        }
      } else {// console.error('vdl-table (' + self.tableId + '): "modifier" attribute must be a function.');
      }
    }

    if (tableOptions.addRemoveRow) {
      var isEditable = tableOptions.columnOptions.some(function (column) {
        return !!column.editable;
      });

      if (!isEditable) {
        tableOptions.addRemoveRow = false; // not a hard error as this is used as a feature when making a table read only based on permissions
        // console.log('vdl-table (' + self.tableId + "): add/remove rows disabled. Table needs to have at least one editable column to use this feature.");
      }
    }

    return tableOptions;
  };
};

function _default(params, componentInfo) {
  var vm = {};

  if (params.width) {
    vm.tableWidth = params.width.replace('px', '');
  }

  var element = componentInfo.element;
  var defaultScenario = params.scenarioId || 0;
  var tableOptions$ = ko.pureComputed(getTableOptions(params));
  var columnConfig$ = ko.observable({});
  var datagrid = new _datagrid.default(tableOptions$, columnConfig$);

  function buildTable() {
    var datagridConfig = $(element).find('vdlx-datagrid-column').map(function (idx, element) {
      return _.clone(element['autotableConfig']);
    });
    var entities = [];
    var indices = {};

    _.forEach(datagridConfig, function (configItem) {
      var scenarioNum = parseIntOrKeep(configItem.scenario || defaultScenario);

      if (_.isNumber(scenarioNum)) {
        if (scenarioNum < 0) {// reject('Scenario index must be a positive integer.');
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

        var indexList = indices[configItem.set];

        var cleanItem = _.omit(configItem, isNullOrUndefined);

        var setPosn = configItem.setPosition;

        if (setPosn == null) {
          indexList.push(cleanItem);
        } else if (indexList[setPosn]) {// reject('Table column for set "' + configItem.set + '" at position ' + setPosn
          //     + ' specified more than once');
        } else {
          indexList[setPosn] = cleanItem; // if we have increased the length, then need to
          // explicitly inserts null/undefined here, or some
          // standard algorithms behave oddly. (E.g. _.map
          // will count the missing items, but [].map won't)

          _.range(indexList.length).forEach(function (j) {
            if (!indexList[j]) {
              indexList[j] = null;
            }
          });
        }
      } else {// reject('Unknown column type');
      }
    });

    var scenarioList = _(entities).filter(function (item) {
      return !isNullOrUndefined(item);
    }).map(function (item) {
      return ko.unwrap(item.scenario);
    }).uniq().sortBy().value();

    if (_.isEmpty(scenarioList) || _.isEmpty(entities)) {
      // console.debug('vdl-table (' + self.tableId + '): Scenario list or table column configuration is empty, ignoring update');
      // if (resolve) {
      //     resolve(tableOptions);
      // }
      // empty table element, to get rid of old configuration
      // $table && $table.empty();
      return;
    }

    columnConfig$({
      columnOptions: entities,
      indicesOptions: indices,
      scenarioList: scenarioList
    });
  }

  var throttledBuildTable = _.throttle(buildTable, COLUMN_UPDATE_DELAY, {
    leading: false
  });

  vm.tableUpdate = function () {
    throttledBuildTable();
  };

  vm.tableValidate = function () {
    debugger;
  };

  vm.validate = function () {
    debugger;
  };

  vm.dispose = function () {};

  buildTable();
  return vm;
}
},{"./datagrid":"vdlx-datagrid/datagrid.js"}],"vdlx-datagrid/index.js":[function(require,module,exports) {
"use strict";

var _attributes = _interopRequireDefault(require("./attributes"));

var _transform = _interopRequireDefault(require("./transform"));

var _viewModel = _interopRequireDefault(require("./view-model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

VDL('vdlx-datagrid', {
  tag: 'vdlx-datagrid',
  attributes: _attributes.default,
  createViewModel: _viewModel.default,
  transform: _transform.default
});
},{"./attributes":"vdlx-datagrid/attributes.js","./transform":"vdlx-datagrid/transform.js","./view-model":"vdlx-datagrid/view-model.js"}],"vdlx-datagrid-column/index.js":[function(require,module,exports) {
(function (window) {
  /*
      vdlx-datagrid-column
  
      To be used as the direct child of <vdlx-datagrid>. <vdlx-datagrid-column may be used multiple times within its parent.
      One of these tags directly generates a column in the resulting Datagrid.
  
      This tag creates config to tell its parent how to populate the datagrid column.
   */
  var enums = insightModules.load('enums');
  var vdlIndexFilter = insightModules.load('vdl/extensions/vdl-index-filter');
  var validatorFactory = insightModules.load('vdl/vdl-validator-factory');
  var insightGetter = insightModules.load('insight-getter');
  var RenderCallbacks = insightModules.load('components/table/render-callbacks');
  var DataUtils = insightModules.load('utils/data-utils');
  var COLUMN_BUILD_DELAY = 50;
  var AUTOCOLUMN_PROP_NAME = 'autotableConfig';
  /*
      vdlx-datagrid-column attributes
  
      TODO do we need to add extra properties for the datagrid?
   */

  var VDGCattributes = [{
    name: 'entity',
    description: 'Name of the array entity to show in this column. Throws an error if the entity doesn\'t exist or is not an array or set type.',
    required: false
  }, {
    name: 'set',
    description: 'Name of the set entity to show in this column. Throws an error if the entity doesn\'t exist or is not a set type.',
    required: false
  }, {
    name: 'set-position',
    description: 'Index (zero-based) of occurrence of that index set in the index tuple for the array.' + 'Defaults to next available position.'
  }, {
    name: 'scenario',
    description: 'The scenario id/index for this column. Not allowed on index column (when specifying a set entity)',
    acceptsExpression: true
  }, {
    name: 'editable',
    description: 'Whether the cells within this column are editable.',
    acceptsExpression: true
  }, {
    name: 'vdl-visible',
    acceptsExpression: true,
    docIgnore: true
  }, {
    name: 'heading',
    description: 'A custom header for this column, will default to be the entity alias. ' + 'Alternatively, you can set the title as the text contents of the <vdlx-datagrid-column> element.',
    acceptsExpression: true
  }, {
    name: 'width',
    description: 'The width, in pixels, to set the column.',
    acceptsExpression: true
  }, {
    name: 'class',
    description: 'CSS classes to add to the table column cells. You can provide multiple classes separated by spaces.',
    acceptsExpression: true
  }, {
    name: 'sort-by-formatted',
    description: 'Use formatted values for sorting.'
  }, {
    name: 'filter-by-formatted',
    description: 'Use formatted values for filtering. This defaults to false unless the entity has a label in which case the default is true.'
  }, {
    name: 'editor-type',
    description: 'The editor type to use, in edit mode, for cells in this column. If not specified then it ' + 'will be autodetected based on entity type. Possible values: checkbox, select, text'
  }, {
    name: 'editor-checked-value',
    description: 'The value to set the cell data to if input type is checkbox and it is checked.'
  }, {
    name: 'editor-unchecked-value',
    description: 'The value to set the cell data to if input type is checkbox and it is not checked.'
  }, {
    name: 'editor-options-set',
    description: 'Name of a set entity to use for select options. This will display labels if a labels entity ' + 'is defined against this set. This will automatically set the editor-type to be "select".'
  }, {
    name: 'editor-options',
    description: 'An expression that results in one of the follow to be used as the select options: an array ' + 'of values, an object of property to value or an array of objects containing key and value properties. ' + 'This will automatically set the editor-type to be "select".',
    acceptsExpression: true,
    expressionVars: [{
      name: 'value',
      type: '(string|boolean|number)',
      description: 'The value of the cell. Its data type will match that of the array elements in this column.'
    }, {
      name: 'rowData',
      type: 'Array.<(string|boolean|number)>',
      description: 'The values from each cell in the current row'
    }],
    expressionReturns: {
      type: 'Array.<*>|Object.<string, string>|Array.<{key: string, value: *}>',
      description: 'An array of values, an object of property to value or an array of objects containing key and value properties'
    }
  }, {
    name: 'editor-options-include-empty',
    description: 'Allow array elements to be removed using the select input. Setting this to true will add ' + 'a blank item to the top of the select list. Defaults to false.'
  }, {
    name: 'render',
    description: 'Reference to a custom cell renderer. Overrides any default entity rendering. This will be used to generate the cell value ' + 'for rendering, filtering and sorting. It must be an expression and resolves as a function, this function should return a string.',
    acceptsExpression: true,
    expressionVars: [{
      name: 'data',
      type: '(string|boolean|number)',
      description: 'The value of the cell being rendered. Its data type will match that of the array elements in this column.'
    }, {
      name: 'type',
      type: 'string',
      description: 'The type call data requested - this will be "filter", "display", "type" or "sort"'
    }, {
      name: 'row',
      type: 'Array.<(string|boolean|number)>',
      description: 'The values from each cell in the current row'
    }]
  }, {
    name: 'format',
    description: 'Specify a number formatting string. Only applicable to array elements of type integer, real, ' + 'decision variable and constraint. The formatting syntax is explained in the Xpress Insight Developer Guide.'
  }];
  VDL('vdlx-datagrid-column', {
    tag: 'vdlx-datagrid-column',
    attributes: VDGCattributes,
    // Apply errors to the parent vdlx-datagrid element
    errorTargetSelector: function errorTargetSelector(element) {
      // error is displayed on autotable, or if there isn't one, the parent
      // will have to do as as default
      return $(element).closest('vdlx-datagrid')[0] || element;
    },
    template: '<vdl-contents></vdl-contents>',
    modifiesDescendants: false,
    createViewModel: function createViewModel(params, componentInfo) {
      var indexFilters$ = ko.observable({});
      var filters$ = ko.pureComputed(function () {
        return _.reduce(indexFilters$(), function (memo, filterProps) {
          return _.set(memo, [filterProps.setName, filterProps.setPosition], filterProps.value);
        }, {});
      });

      var columnId = _.uniqueId('datagrid-column');

      var buildColumn = _.throttle(function (done) {
        console.log('vdlx-datagrid update column');

        var columnReady = $(componentInfo.element).find('vdl-index-filter').length === _.size(indexFilters$());

        var props = {
          scenario: ko.unwrap(params.scenario),
          title: ko.unwrap(params.heading),
          width: ko.unwrap(params.width),
          editable: ('' + ko.unwrap(params.editable)).toLowerCase() === 'true',
          visible: !(('' + ko.unwrap(params.visible)).toLowerCase() === 'false'),
          style: params.style,
          sortByFormatted: params.sortByFormatted,
          filterByFormatted: params.filterByFormatted,
          editorOptionsSet: params.editorOptionsSet,
          selectNull: params.editorOptionsIncludeEmpty,
          checkedValue: params.editorCheckedValue,
          uncheckedValue: params.editorUncheckedValue,
          editorType: params.editorType,
          id: columnId
        };

        if (params.editorOptions) {
          props.editorOptions = function () {
            // Return an empty list of options if value is undefined
            return params.editorOptions.apply(null, arguments) || [];
          };
        }

        if (_.isFunction(params.render)) {
          props.render = params.render;
        }

        if (params.format) {
          props.render = RenderCallbacks.markAsBuiltinRenderCallback(function (data, type) {
            var formatCell = type === 'display' || type === 'filter' && params.filterByFormatted || type === 'sort' && params.sortByFormatted;
            return formatCell ? insightGetter().Formatter.formatNumber(data, params.format) : data;
          });
          props.format = params.format;
        } else {
          props.format = null;
        }

        if (!!params.entity) {
          props.entity = params.entity;
        } else if (!!params.set) {
          props.set = params.set;
        }

        if (params.setPosition != null) {
          props.setPosition = params.setPosition;
        }

        if (_.size(filters$())) {
          props.filters = filters$();
        }

        if (props.entity) {
          var getValidationFn = function getValidationFn(indices) {
            var validationProperties = validatorFactory.getValidationProperties({
              entity: props.entity,
              indices: indices
            });
            var customValidators = validatorFactory.getCustomValidators(validationProperties, componentInfo.element);
            return validatorFactory.createFromValidators(customValidators);
          };

          var validationObservable = ko.observable().extend({
            functionObservable: {
              onDependenciesChange: function onDependenciesChange() {
                params.tableValidate();
              },
              read: function read(indices, value, rowData) {
                return getValidationFn(indices)(value, rowData);
              },
              disposeWhenDependenciesChange: false
            }
          });

          props.editorValidate = function (newValue, rowData, keys) {
            validationObservable(keys, newValue, rowData);
            return validationObservable.peek();
          };
        }

        if (columnReady) {
          componentInfo.element[AUTOCOLUMN_PROP_NAME] = props;
          _.isFunction(params.tableUpdate) && params.tableUpdate();
        }

        if (_.isFunction(done)) {
          done();
        }
      }, COLUMN_BUILD_DELAY, {
        leading: false
      });

      var paramsWatcher = ko.computed(function () {
        var constructedParams = {
          scenario: ko.unwrap(params.scenario),
          title: ko.unwrap(params.heading),
          width: ko.unwrap(params.width),
          editable: ko.unwrap(params.editable),
          visible: ko.unwrap(params.visible)
        };
        buildColumn();
        return constructedParams;
      });
      return {
        columnUpdate: buildColumn,
        validate: buildColumn,
        dispose: function dispose() {
          paramsWatcher.dispose();
          _.isFunction(params.tableUpdate) && params.tableUpdate();
        },
        filterUpdate: function filterUpdate(filterId, filterProperties) {
          indexFilters$(_.set(indexFilters$(), filterId, filterProperties));
          buildColumn();
        },
        filterRemove: function filterRemove(filterId) {
          indexFilters$(_.omit(indexFilters$(), filterId));
          buildColumn();
        }
      };
    },
    transform: function transform(element, attributes, api) {
      var $element = $(element);

      if (!$element.closest('vdlx-datagrid').length) {
        throw Error('<vdlx-datagrid-column> must be contained within a <vdlx-datagrid> tag.');
      }

      if (!attributes.entity && !attributes.set) {
        throw Error('Must specify either an "entity" or "set" attribute for <vdlx-datagrid-column>.');
      }

      if (attributes.entity && attributes.set) {
        throw Error('You cannot specify both "entity" and "set" on a <vdlx-datagrid-column>.');
      }

      if (attributes['set-position'] && !attributes.set) {
        throw Error('You cannot specify "set-position" without also specifying "set"');
      }

      if (attributes.set && attributes.scenario) {
        throw Error('The "scenario" attribute cannot be used in combination with the "set" attribute on a <vdlx-datagrid-column>.');
      }

      var entityAttr = !!attributes.entity ? attributes.entity : attributes.set;
      var entityName = entityAttr.rawValue;
      var entity = api.getModelEntityByName(entityName);

      if (!entity) {
        throw Error('Entity "' + entityName + '" does not exist in the model schema.');
      }

      var setPosition = _.get(attributes, ['set-position', 'rawValue']);

      if (setPosition != null) {
        if (!/^\d+$/.test(setPosition)) {
          throw Error('Invalid set-position "' + setPosition + '", must be a number at least zero');
        } else {
          setPosition = +setPosition;
        }
      }

      var entityType = entity.getType();

      if (attributes.entity && entityType !== enums.DataType.ARRAY) {
        throw Error('Entity type ' + entityType + ' cannot be displayed as a column in <vdlx-datagrid>.');
      } else if (attributes.set && entityType !== enums.DataType.SET) {
        throw Error('Entity type ' + entityType + ' cannot be specified as an index set in <vdlx-datagrid>.');
      }

      var paramsBuilder = api.getComponentParamsBuilder(element).addParam('tableUpdate', '$component.tableUpdate', true).addParam('tableValidate', '$component.tableValidate', true).addParam('validate', '$component.validate', true);

      if (!!attributes.entity) {
        paramsBuilder.addParam('entity', entityName);
      } else {
        paramsBuilder.addParam('set', entityName);
      }

      if (setPosition != null) {
        paramsBuilder.addParam('setPosition', setPosition);
      }

      var heading = attributes['heading'];

      if (heading) {
        paramsBuilder.addRawOrExpressionParam('heading', heading);
      } else {
        var textContent = $(element).contents().filter(function (index, element) {
          return element.nodeType === Node.TEXT_NODE && element.textContent.trim() !== '';
        }).toArray().map(function (element) {
          return element.textContent.trim();
        }).join(' ');

        if (textContent) {
          paramsBuilder.addParam('heading', textContent);
        }
      }

      var scenario = attributes['scenario'];

      if (scenario) {
        paramsBuilder.addRawOrExpressionParam('scenario', scenario);
      }

      var editable = attributes['editable'];

      if (attributes['editable']) {
        if (entity.getManagementType() === enums.EntityManagementType.RESULT) {
          throw Error('Cannot set editable attribute on a <vdlx-datagrid-column> bound to a result entity.');
        }

        paramsBuilder.addRawOrExpressionParam('editable', editable);
      }

      var visible = attributes['vdl-visible'];

      if (visible) {
        if (visible.expression.isString || _.isEmpty(visible.expression.value)) {
          throw Error('vdl-visible has to be an expression');
        }

        paramsBuilder.addRawOrExpressionParam('visible', visible);
        $element.removeAttr('vdl-visible');
      }

      var width = attributes['width'];

      if (width) {
        paramsBuilder.addRawOrExpressionParam('width', width); // Remove the width attribute from the vdlx-datagrid-column as it has implications on page layout

        $element.removeAttr('width');
      }

      var style = attributes['class'];

      if (style) {
        paramsBuilder.addRawOrExpressionParam('style', style); // Remove the class attribute from the vdlx-datagrid-column as it has implications on styling for the hidden element

        $element.removeAttr('class');
      }

      var sortByFormatted = attributes['sort-by-formatted'];

      if (sortByFormatted && sortByFormatted.rawValue === 'true') {
        paramsBuilder.addParam('sortByFormatted', true);
      }

      var filterByFormatted = attributes['filter-by-formatted'];

      if (filterByFormatted) {
        if (filterByFormatted.rawValue === 'true') {
          paramsBuilder.addParam('filterByFormatted', true);
        } else if (filterByFormatted.rawValue === 'false') {
          paramsBuilder.addParam('filterByFormatted', false);
        }
      }

      var editorType = attributes['editor-type'];
      var editorTypes = ['checkbox', 'select', 'text'];

      if (editorType && editorTypes.indexOf(editorType.rawValue) !== -1) {
        if (editorType.rawValue === 'select') {
          if (!attributes['editor-options-set'] && !attributes['editor-options']) {
            throw Error('vdlx-datagrid-column with "editor-type" of "select" needs either the "editor-options-set" or the "editor-options" attribute to be supplied.');
          }
        }

        paramsBuilder.addParam('editorType', editorType.rawValue);
      }

      var editorCheckedValue = attributes['editor-checked-value'];

      if (editorCheckedValue) {
        paramsBuilder.addParam('editorCheckedValue', editorCheckedValue.rawValue);
      }

      var editorUncheckedValue = attributes['editor-unchecked-value'];

      if (editorUncheckedValue) {
        paramsBuilder.addParam('editorUncheckedValue', editorUncheckedValue.rawValue);
      }

      var editorOptionsSet = attributes['editor-options-set'];

      if (editorOptionsSet) {
        var optionsSetEntity = api.getModelEntityByName(editorOptionsSet.rawValue);

        if (!optionsSetEntity) {
          throw Error('vdlx-datagrid-column editor-options-set entity "' + editorOptionsSet.rawValue + '" does not exist in the model schema.');
        }

        var optionsSetEntityType = optionsSetEntity.getType();

        if (optionsSetEntityType !== enums.DataType.SET) {
          throw Error('Entity "' + editorOptionsSet.rawValue + '" cannot be used as editor-options-set, wrong data type.');
        }

        paramsBuilder.addParam('editorOptionsSet', editorOptionsSet.rawValue);
      }

      var editorOptions = attributes['editor-options'];

      if (editorOptions) {
        if (editorOptions.expression.isString) {
          throw Error('vdlx-datagrid-column attribute "editor-options" must be an expression.');
        }

        paramsBuilder.addFunctionOrExpressionParam('editorOptions', editorOptions.expression.value, ['value', 'rowData']);
      }

      if (editorOptionsSet && editorOptions) {
        throw Error('vdlx-datagrid-column cannot have both editor-options-set and editor-options specified.');
      }

      var editorOptionsIncludeEmpty = attributes['editor-options-include-empty'];

      if (editorOptionsIncludeEmpty) {
        paramsBuilder.addParam('editorOptionsIncludeEmpty', editorOptionsIncludeEmpty.rawValue === 'true');
      }

      var render = attributes['render'];

      if (render) {
        if (render.expression.isString) {
          throw Error('Render parameter has to be an expression');
        }

        paramsBuilder.addParam('render', render.expression.value, true);
      }

      var format = attributes['format'];

      if (format) {
        if (!DataUtils.entityTypeIsNumber(entity)) {
          throw Error('Entity ' + entityName + ' with element type ' + entity.getElementType() + ' cannot be formatted');
        }

        paramsBuilder.addParam('format', format.rawValue);
      }
    }
  });
})(window);
},{}],"index.js":[function(require,module,exports) {
"use strict";

require("../css/vdlx-datagrid.scss");

require("./vdlx-datagrid");

require("./vdlx-datagrid-column");
},{"../css/vdlx-datagrid.scss":"../css/vdlx-datagrid.scss","./vdlx-datagrid":"vdlx-datagrid/index.js","./vdlx-datagrid-column":"vdlx-datagrid-column/index.js"}]},{},["index.js"], null)
//# sourceMappingURL=/vdlx-datagrid.map