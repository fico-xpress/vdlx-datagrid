import { insightModules } from './insight-globals';

const bridge = insightModules.load('bridge')();
const dataStore = insightModules.load('skeleton/data-store');

dataStore.prototype.subscribe = function (subscription) {
    // Must subscribe to some scenarios
    if (!subscription.selection.length) {
        return false;
    }
    // Must subscribe to summary data or some entities or attachments or execution status
    if (!(subscription.subscribeToSummaryUpdate ||
        subscription.entities.length || subscription.subscribeToAttachments || subscription.subscribeToExecutionStatus)) {
        return false;
    }

    // The check for filtered and non-filtered usage of entities has been removed compared with the original.
    // This is to allow server-side filtering based on a filter select input (full index set) and the filtered entity in the datagrid

    this._subscriptions.push(subscription);

    // When a scenario is about to be used, mark as 'touched'
    if (!subscription.spying) {
        _.each(subscription.selection, bridge.touchScenario.bind(bridge));
    }

    var viewProperties = this._viewPropertyStore.cloneProperties();

    // Fetch initial scenarios and data
    if (subscription.selection.length) {
        this.fetchScenarios(subscription.selection).then(subscription.scenarioUpdate);
    }

    var cacheEntries = this._scheduleSubscriptionNotification(subscription, viewProperties);
    this._dataRequest.fetch(cacheEntries);

    return true;
};
