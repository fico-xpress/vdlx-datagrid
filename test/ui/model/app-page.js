import {Selector, t} from "testcafe";

export default class AppPage {
    constructor() {
        this.shelf = Selector('shelf-panel.explorer-launcher');
        this.explorerScenarioOne = Selector('a.explorer-item-link').withExactText('Scenario 1');
        this.closeExplorerBtn = Selector('explorer .modal-footer button').withExactText('CLOSE');
        this.vdlIframe = Selector('#view-iframe');
        this.viewNavigator = Selector('#viewMenuWrapper .btn');

        this.TAB_GROUP_MAIN = Selector('#viewMenu .item-title .view-group-tree-item')
            .withExactText('Main');

        this.TAB_MAIN_EXAMPLE_ONE = this.TAB_GROUP_MAIN
            .parent()
            .find('item')
            .withText('Example One');

        this.TAB_GROUP_VDL_LANG = Selector('#viewMenu .item-title .view-group-tree-item')
            .withExactText('VDL Lang - Tables Compatibility');

        this.TAB_VDL_LANG_BASIC_TABLE = this.TAB_GROUP_VDL_LANG
            .parent()
            .find('.item')
            .withText('Basic usage');

        this.TAB_VDL_LANG_EDITABLE_TABLES = this.TAB_GROUP_VDL_LANG
            .parent()
            .find('.item')
            .withText('Editable tables');
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
            .click(this.viewNavigator);
        await t
            .click(selector)
            .switchToIframe(this.vdlIframe);

    }
}