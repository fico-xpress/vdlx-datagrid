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
        await appPage.visitTab(appPage.tabExampleOne);
    });

test('Check grid column count', async t => {
    const demo1grid = Selector('#demo1');
    const columns = demo1grid.find('.tabulator-col');

    await t
        .expect(demo1grid.exists).ok()
        .expect(columns.count).eql(3);
});

test('Check grid cell count', async t => {
    const demo1grid = Selector('#demo1');
    const gridCells = demo1grid.find('.tabulator-cell');

    await t
        .expect(gridCells.count).eql(12);
});