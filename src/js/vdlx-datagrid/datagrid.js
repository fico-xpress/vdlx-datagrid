import dataTransform, { getAllColumnIndices, getDisplayIndices } from './data-transform';
import { map, combineAndMap } from './ko-utils';
import withScenarioData from './data-loader';

const createTabulatorFactory = selector => config => new Tabulator(selector, config);

const SelectOptions = insightModules.load('components/autotable-select-options');

class Datagrid {
  constructor(options$) {
    const schema = insight
      .getView()
      .getProject()
      .getModelSchema();
    const scenariosData$ = withScenarioData(options$);
    const indicesOptions$ = map(_.property('indicesOptions'), options$);
    const entitiesOptions$ = map(_.property('columnOptions'), options$);
    const allColumnIndices$ = map(getAllColumnIndices(schema), entitiesOptions$);

    /** @type {KnockoutComputed<import('./data-transform').SetNameAndPosition[]>} */
    const setNameAndPosns$ = combineAndMap(
      ([columnIndices, entitiesOptions]) => getDisplayIndices(columnIndices, entitiesOptions),
      [allColumnIndices$, entitiesOptions$]
    );

    const setNamePosnsAndOptions$ = combineAndMap(
      ([setNameAndPosns, indicesOptions]) =>
        _.map(setNameAndPosns, setNameAndPosn => ({
          ...setNameAndPosn,
          options: _.get(indicesOptions, `${setNameAndPosn.name}.${setNameAndPosn.position}`, {
            id: `${setNameAndPosn.name}.${setNameAndPosn.position}`
          })
        })),
      [setNameAndPosns$, indicesOptions$]
    );

    const allScenarios$ = map(
      scenariosData =>
        scenariosData && _.uniq([scenariosData.defaultScenario].concat(_.values(scenariosData.scenarios))),
      scenariosData$
    );

    const indicesColumns$ = combineAndMap(
      ([setNamePosnsAndOptions, allScenarios]) => {
        return _.map(setNamePosnsAndOptions, setNameAndPosn => {
          const { name, options } = setNameAndPosn;
          const entity = schema.getEntity(name);

          return {
            title: String(options.title || entity.getAbbreviation() || name),
            field: options.id,
            mutatorData: (value, data, type, params) => SelectOptions.getLabel(schema, allScenarios, entity, value)
          };
        });
      },
      [setNamePosnsAndOptions$, allScenarios$]
    );

    const entitiesColumns$ = map(
      entitiesOptions => _.map(entitiesOptions, entity => _.assign(entity, { title: entity.name, field: entity.id })),
      entitiesOptions$
    );

    const columns$ = combineAndMap(_.flatten, [indicesColumns$, entitiesColumns$]);

    columns$.subscribe(console.log);

    const tabulatorFactory$ = map(
      options => (options.tableId ? createTabulatorFactory(`#${options.tableId}`) : _.noop),
      options$
    );

    const tabulatorOptions$ = map(
      options => ({
        layout: 'fitColumns',
        height: options.gridHeight || '600px',
        placeholder: 'Waiting for data',
        groupStartOpen: false,
        ajaxLoader: true,
        columns: []
      }),
      options$
    );

    tabulatorOptions$.subscribe(console.log);

    const table$ = combineAndMap(([factory, options]) => factory(options), [tabulatorFactory$, tabulatorOptions$]);

    table$.subscribe(oldTable => oldTable && oldTable.destroy(), null, 'beforeChange');

    const data$ = combineAndMap(params => !_.some(params, _.isEmpty) && dataTransform(...params), [
      allColumnIndices$,
      entitiesColumns$,
      setNamePosnsAndOptions$,
      scenariosData$
    ]);

    combineAndMap(
      ([table, data]) =>
        table &&
        data &&
        table
          .setData(data)
          .then(function() {
            table.redraw();
          })
          .catch(function(err) {
            debugger;
          }),
      [table$, data$]
    ).subscribe(_.noop);

    combineAndMap(([table, columns]) => table && columns && table.setColumns(columns), [table$, columns$]).subscribe(
      _.noop
    );
  }
}

export default Datagrid;
