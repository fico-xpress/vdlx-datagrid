export interface SetNameAndPosition {
    name: string;
    position: number;
}

export interface FilterPositionAndValue {
    index: number;
    value: any;
}

export interface DataUtils {
    getFilterPositionsAndValues(filters: any, indexSetsAndPositions: SetNameAndPosition[]): FilterPositionAndValue[];
    getSetNamesAndPosns(indexSets: string[]): SetNameAndPosition[];
    entityTypeIsNumber(entity: any): boolean;
}

export interface InsightModules {
    load(mod: 'external-libs/knockout'): KnockoutStatic;
    load(mod: 'utils/data-utils'): DataUtils;
    load(mod: 'vdl-validator-registry'): any;
    load(mod: 'vdl/vdl-validator-factory'): any;
    load(mod: 'dialogs'): any;
    load(mod: 'insight-getter'): any;
    load(mod: 'enums'): any;
    load(mod: 'components/table/create-sparse-data'): any;
    load(mod: 'components/table/create-dense-data'): any;
    load(mod: 'components/autotable-select-options'): any;
    load(mod: 'data/set-sorter'): any;
    load(mod: string): any;
}
