import {Selector, t} from "testcafe";
import _ from 'lodash';

export default class AppPage {
    constructor() {
        this.shelf = Selector('shelf-panel.explorer-launcher');
        this.explorerScenarioOne = Selector('a.explorer-item-link').withExactText('Scenario 1');
        this.closeExplorerBtn = Selector('explorer .modal-footer button').withExactText('CLOSE');
        this.vdlIframe = Selector('#view-iframe');
        this.viewNavigator = Selector('#viewMenuWrapper .btn');

        this.TAB_GROUPS = Selector('#viewMenu .item-title .view-group-tree-item');

        this.TAB_GROUP_MAIN = this.TAB_GROUPS
            .withExactText('Main');

        this.TAB_MAIN_EXAMPLE_ONE = this.TAB_GROUP_MAIN
            .parent()
            .find('item')
            .withText('Example One');

        this.TAB_GROUP_VDL_LANG = this.TAB_GROUPS
            .withExactText('VDL Lang - Tables Compatibility');

        this.TAB_VDL_LANG_BASIC_TABLE = this.TAB_GROUP_VDL_LANG
            .parent()
            .find('.item')
            .withText('Basic usage');

        this.TAB_VDL_LANG_EDITABLE_TABLES = this.TAB_GROUP_VDL_LANG
            .parent()
            .find('.item')
            .withText('Editable tables');

        this.TAB_GROUP_BIG_DATA = this.TAB_GROUPS
            .withExactText('Big Data');

        _.forEach(_.range(1,6), n => {
            this[`TAB_BIG_DATA_EXAMPLE${n}`] = this.TAB_GROUP_BIG_DATA
                .parent()
                .find('.item')
                .withText(`Big Data Table ${n}`);
        });
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