import {
    checkboxFilterFunc,
    getHeaderFilterEmptyCheckFn,
    getHeaderFilterParams
} from '../../../src/js/datagrid/column-filter-utils';
import {EDITOR_TYPES} from "../../../src/js/constants";
import find from "lodash/find";

describe('column filter utils', () => {

    describe('checkboxFilterFunc', () => {

        describe('filters correctly', () => {
            let cellValue;
            describe('when values are false', () => {
                beforeEach(() => {
                    cellValue = false;
                });
                it('returns true for when looking for un checked', () => {
                    expect(checkboxFilterFunc('false', cellValue, {}, {})).toEqual(true);
                });
                it('returns false for when looking for checked', () => {
                    expect(checkboxFilterFunc('true', cellValue, {}, {})).toEqual(false);
                });
            });

            describe('when values are true', () => {
                beforeEach(() => {
                    cellValue = true;
                });
                it('returns false for when looking for un checked', () => {
                    expect(checkboxFilterFunc('false', cellValue, {}, {})).toEqual(false);
                });
                it('returns true for when looking for checked', () => {
                    expect(checkboxFilterFunc('true', cellValue, {}, {})).toEqual(true);
                });
            });

            describe('when values are strings', () => {
                beforeEach(() => {
                    cellValue = 'hello';
                });
                it('returns false for when looking for un checked', () => {
                    expect(checkboxFilterFunc('goodbye', cellValue, {}, {})).toEqual(false);
                });
                it('returns true for when looking for checked', () => {
                    expect(checkboxFilterFunc('hello', cellValue, {}, {})).toEqual(true);
                });
            });

        });

    });

    describe('getHeaderFilterParams', () => {

        describe('when column editor is checkbox', () => {

            it('when no entityOptions', () => {
                const column = {editor: EDITOR_TYPES.checkbox};
                const entityOptions = {};

                expect(getHeaderFilterParams(column, entityOptions)).toEqual({
                        values: [
                            {label: 'No Filter', value: undefined},
                            {label: 'Checked', value: "true"},
                            {label: 'Unchecked', value: "false"}
                        ]
                    }
                );
            });
            it('with entityOptions', () => {
                const column = {editor: EDITOR_TYPES.checkbox};
                const entityOptions = {
                    checkedValue: 'yep',
                    uncheckedValue: 'nope'
                };

                expect(getHeaderFilterParams(column, entityOptions)).toEqual({
                        values: [
                            {label: 'No Filter', value: undefined},
                            {label: 'Checked', value: 'yep'},
                            {label: 'Unchecked', value: 'nope'}
                        ]
                    }
                );
            });
        });

        describe('when column editor is not a checkbox', () => {
            it('input editor', () => {
                const column = {editor: EDITOR_TYPES.text};
                expect(getHeaderFilterParams(column, {})).toEqual(undefined);
            });
            it('select editor', () => {
                const column = {editor: EDITOR_TYPES.list};
                expect(getHeaderFilterParams(column, {})).toEqual(undefined);
            });
        });
    });

    describe('getHeaderFilterEmptyCheckFn', () => {
        let column;
        let params;
        beforeEach(() => {
            column = {editor: EDITOR_TYPES.checkbox};
            params = {
                values: [
                    {label: 'No Filter', value: undefined},
                    {label: 'Checked', value: 'yep'},
                    {label: 'Unchecked', value: 'nope'}
                ]
            };
        });

        describe('function creation', () => {
            it(' returns undefind for input column/editor', () => {
                expect(getHeaderFilterEmptyCheckFn({editor: EDITOR_TYPES.text}, params)).toEqual(undefined);
            });
            it(' returns undefind for select column/editor', () => {
                expect(getHeaderFilterEmptyCheckFn({editor: EDITOR_TYPES.list}, params)).toEqual(undefined);
            });

            it('creates a function for a checkbox column/editor', () => {
                expect(getHeaderFilterEmptyCheckFn(column, params)).toEqual(expect.any(Function));
            });
        });

        describe('testing the created headerFilterEmptyCheck function', () => {
            let headerFilterEmptyCheckFn;
            beforeEach(() => {
                headerFilterEmptyCheckFn = getHeaderFilterEmptyCheckFn(column, params);
            });

            it('created function returns true for No Filter option', () => {
                const noOption = find(params.values, (param) => param.label === 'No Filter');
                expect(headerFilterEmptyCheckFn(noOption.value)).toEqual(true);
            });

            it('created function returns true for checked option', () => {
                const checkedOption = find(params.values, (param) => param.label === 'Checked');
                expect(headerFilterEmptyCheckFn(checkedOption.value)).toEqual(false);
            });
            it('created function returns true for Unchecked option', () => {
                const uncheckedOption = find(params.values, (param) => param.label === 'Unchecked');
                expect(headerFilterEmptyCheckFn(uncheckedOption.value)).toEqual(false);
            });
        });
    });

});
