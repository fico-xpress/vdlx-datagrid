import getScenarioData from '../../../src/js/vdlx-datagrid/data-loader';
import { scenarioObserverMock, getEntityMock } from '../../jest/mocks/insight-modules';
import ko from 'knockout';

describe('data loader', () => {
    beforeEach(() => {});

    describe('index filtering', () => {
        it('adds filters', (done) => {
            const entity = 'entity';
            const index = 'index';
            getEntityMock(entity).getIndexSets.mockReturnValue([index]);
            const scenarioId = 0;
            const config = ko.observable({
                scenarioList: [1, 2, 3],
                columnOptions: [
                    {
                        id: 'column-id',
                        name: entity,
                        scenario: scenarioId,
                    },
                ],
            });
            const filters = ko.observable([{ setName: index, setPosition: 0, value: [] }]);
            const scenarioData = getScenarioData(config, filters);
            scenarioData.data.subscribe(() => {
                expect(scenarioObserverMock.filter).toHaveBeenCalledWith(entity, expect.any(Function));
                scenarioObserverMock.filter.mock.calls[0][1]();
                done();
            });
            const notifyCallback = scenarioObserverMock.notify.mock.calls[0][0];
            notifyCallback([{ getId: jest.fn().mockReturnValue(scenarioId), getSelectionIndex: jest.fn() }]);
        });
    });
});
