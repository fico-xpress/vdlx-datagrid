(function (window) {
    /** @constructor */
    function Datagrid(config) {

    }

    Datagrid.prototype.updateConfig = function (config) {

    };

    window.DATAGRID = _.assign({}, window.DATAGRID, {datagrid: Datagrid});
})(window);