import { insightModules } from './insight-globals';

export const ko = insightModules.load('external-libs/knockout');
export const $ = insightModules.load('external-libs/jquery');
export const dialogs = insightModules.load('dialogs');
export const dataUtils = insightModules.load('utils/data-utils');
export const createSparseData = insightModules.load('components/table/create-sparse-data');
export const createDenseData = insightModules.load('components/table/create-dense-data');
export const SelectOptions = insightModules.load('components/autotable-select-options');
export const enums = insightModules.load('enums');
export const setSorter = insightModules.load('data/set-sorter');
export const validatorRegistry = insightModules.load('vdl-validator-registry');
export const validatorFactory = insightModules.load('vdl/vdl-validator-factory');
export const insightGetter = insightModules.load('insight-getter');
