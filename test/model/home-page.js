import {Selector, t} from "testcafe";

export default class HomePage {
    constructor() {
        this.tablePerformance = Selector('.project-link').withExactText('Table Performance');
    }

    /**
     * Enter an Insight App
     * @param appSelector
     * @returns {Promise<void>}
     */
    async enterApp(appSelector) {
        await t.click(appSelector);
    }
}
