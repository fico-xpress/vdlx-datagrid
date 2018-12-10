
/**
 * @typedef {Object} indexFilterVMParams
 * @property {function(string, Object)} filterUpdate
 * @property {function(string)} filterRemove
 * @property {string} setName
 * @property {string} setPosition
 * @property {string} value
 */

/**
 * @param {indexFilterVMParams} params
 */
export default function (params) {
    var guid = _.uniqueId('vdl-index-filter-');
    var filterUpdate = _.partial(params.filterUpdate, guid);
    var filterRemove = _.partial(params.filterRemove, guid);

    var filters$ = ko
        .pureComputed(function () {
            return {
                setName: params.setName,
                setPosition: params.setPosition,
                value: ko.unwrap(params.value).toString()
            };
        });

    var filters$Subscription = filters$.subscribe(filterUpdate);
    filterUpdate(filters$());

    return {
        dispose: function () {
            filters$Subscription.dispose();
            filterRemove();
        }
    };
};