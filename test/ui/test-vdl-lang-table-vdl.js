import { Selector, t } from 'testcafe';
import LoginPage from './model/login-page';
import HomePage from './model/home-page';
import AppPage from './model/app-page';

const loginPage = new LoginPage();
const homePage = new HomePage();
const appPage = new AppPage();

fixture('Test simple datagrid')
    .page('http://localhost:8860/insight?debug=true')
    .beforeEach( async t => {
        await loginPage.login();
        await homePage.enterApp(homePage.tablePerformance);
        await appPage.addScenarioToShelf(appPage.explorerScenarioOne);
        await appPage.visitTab(appPage.TAB_VDL_LANG_BASIC_TABLE);
    });

// Example 1 - SIMPLE DATAGRID
test('Check datagrid example 1 column count', async t => {
    const datagridExample1 = Selector('#basic-example-1');
    const columns = datagridExample1.find('.tabulator-col');

    await t
        .expect(datagridExample1.exists).ok()
        .expect(columns.count).eql(3);
});

// Example 2 - SIMPLE DATAGRID WITH REPEATED INDEX SETS
test('Check datagrid example 2 column count', async t => {
    const datagridExample2 = Selector('#basic-example-2');
    const columns = datagridExample2.find('.tabulator-col');

    await t
        .expect(datagridExample2.exists).ok()
        .expect(columns.count).eql(3);
});

// Example 3 - DATAGRID WITH A CSS CLASS
test('Check datagrid example 3 column count', async t => {
    const datagridExample3 = Selector('#basic-example-3');
    const columns = datagridExample3.find('.tabulator-col');

    await t
        .expect(datagridExample3.exists).ok()
        .expect(columns.count).eql(3)
        .expect(datagridExample3.hasClass('htable'));
});

// Example 4 - HIDDEN INDEX COLUMN
test('Check datagrid example 4 column count', async t => {
    const datagridExample4 = Selector('#basic-example-4');
    const columns = datagridExample4.find('.tabulator-col');

    await t
        .expect(datagridExample4.exists).ok()
        .expect(columns.count).eql(2); // Index column is hidden so expect only 2 columns.
});

