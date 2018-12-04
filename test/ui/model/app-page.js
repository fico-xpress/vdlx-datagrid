import {Selector, t} from "testcafe";

export default class AppPage {
    constructor() {
        this.shelf = Selector('shelf-panel.explorer-launcher');
        this.explorerScenarioOne = Selector('a.explorer-item-link').withExactText('Scenario 1');
        this.closeExplorerBtn = Selector('explorer .modal-footer button').withExactText('CLOSE');
        this.tabExampleOne = Selector('.view-select-item').withExactText('Example One');
        this.vdlIframe = Selector('#view-iframe');
    }

    /**
     * Pick a scenario and add it to the shelf.
     *
     * @param scenario
     * @returns {Promise<void>}
     */
    async addScenarioToShelf(scenario) {
        await t
            .click(this.shelf)
            .click(scenario)
            .click(this.closeExplorerBtn);
    }

    /**
     * TODO May change this function to use view navigator, ViewGroup -> ViewTab
     * @param selector
     * @returns {Promise<void>}
     */
    async visitTab(selector) {
        await t
            .click(selector)
            .switchToIframe(this.vdlIframe);

    }
}