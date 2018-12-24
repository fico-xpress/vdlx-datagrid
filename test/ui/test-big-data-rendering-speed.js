import { Selector, t } from 'testcafe';
import LoginPage from './model/login-page';
import HomePage from './model/home-page';
import AppPage from './model/app-page';

const loginPage = new LoginPage();
const homePage = new HomePage();
const appPage = new AppPage();

fixture('Test datagrid with Big Data')
    .page('http://localhost:8860/insight?debug=true')
    .beforeEach( async t => {
        await loginPage.login();
        await homePage.enterApp(homePage.tablePerformance);
        await appPage.addScenarioToShelf(appPage.explorerScenarioOne);
        await appPage.visitTab(appPage.TAB_BIG_DATA_EXAMPLE1);
    });

// Example 1
test.only('Check Big Data example 1 column count', async t => {
    const bigData1 = Selector('#big-data-1', {timeout: 50, visibilityCheck: true});
    const columns = bigData1.find('.tabulator-col');
    const firstRow = Selector('#big-data-1 .tabulator-row', {timeout: 50, visibilityCheck: true});

    await t
        .expect(firstRow.exists).ok()
        .expect(columns.count).eql(11);
});

// Example 4
test.only('Check Big Data example 1 column count', async t => {
    const bigData4 = Selector('#big-data-4', {timeout: 50, visibilityCheck: true});
    const columns = bigData4.find('.tabulator-col');
    const firstRow = Selector('#big-data-4 .tabulator-row', {timeout: 50, visibilityCheck: true});

    await t
        .expect(firstRow.exists).ok()
        .expect(columns.count).eql(11);
});
