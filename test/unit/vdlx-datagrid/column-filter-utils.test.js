import {checkboxFilterFunc, getHeaderFilterParams} from '../../../src/js/vdlx-datagrid/column-filter-utils';
import {EDITOR_TYPES} from "../../../src/js/constants";

describe('column filter utils', () => {

    describe('checkboxFilterFunc', () => {

        describe('filters correctly', () => {
            let cellValue;
            describe('when values are false', () => {
                beforeEach(() => {
                    cellValue = false;
                });
                it('returns true for when looking for un checked', () => {
                    expect(checkboxFilterFunc('false', cellValue, {},{} )).toEqual(true);
                });
                it('returns false for when looking for checked', () => {
                    expect(checkboxFilterFunc('true', cellValue, {},{} )).toEqual(false);
                });
            });

            describe('when values are true', () => {
                beforeEach(() => {
                    cellValue = true;
                });
                it('returns false for when looking for un checked', () => {
                    expect(checkboxFilterFunc('false', cellValue, {},{} )).toEqual(false);
                });
                it('returns true for when looking for checked', () => {
                    expect(checkboxFilterFunc('true', cellValue, {},{} )).toEqual(true);
                });
            });

            describe('when values are strings', () => {
                beforeEach(() => {
                    cellValue = 'hello';
                });
                it('returns false for when looking for un checked', () => {
                    expect(checkboxFilterFunc('goodbye', cellValue, {},{} )).toEqual(false);
                });
                it('returns true for when looking for checked', () => {
                    expect(checkboxFilterFunc('hello', cellValue, {},{} )).toEqual(true);
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
                        {label: "No Filter", value: undefined},
                        {label: "Checked", value: "true"},
                        {label: "Unchecked", value: "false"}
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
                            {label: "No Filter", value: undefined},
                            {label: "Checked", value: "yep"},
                            {label: "Unchecked", value: "nope"}
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
                const column = {editor: EDITOR_TYPES.select};
                expect(getHeaderFilterParams(column, {})).toEqual(undefined);
            });
        });
    });

});
