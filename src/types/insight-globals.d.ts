export interface insightModules {
    load(mod: 'external-libs/knockout') : KnockoutStatic;
    load(mod: 'utils/data-utils'): any;
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