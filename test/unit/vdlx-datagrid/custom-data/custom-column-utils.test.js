import {
    createBasicColumnDefinition,
    createValueTypedColumnProperties,
    removePropsNotInApprovedList
} from "../../../../src/js/vdlx-datagrid/custom-data/custom-column-utils";

describe('custom column utils', () => {

    describe('createValueTypedColumnProperties', () => {

        it('returns checkbox props', () => {
            expect(createValueTypedColumnProperties(true)).toEqual({
                editor: 'checkbox',
                elementType: 'BOOLEAN',
                formatter: expect.any(Function),
                sorter: 'boolean'}
            );
        });
        it('returns numeric props', () => {
            expect(createValueTypedColumnProperties(123)).toEqual({
                editor: 'input',
                elementType: 'INTEGER',
                cssClass: 'numeric',
                sorter: 'number'}
            );
        });
        it('returns string props', () => {
            expect(createValueTypedColumnProperties('abc')).toEqual({
                editor: 'input',
                elementType: 'STRING',
                sorter: 'string'}
            );
        });
    });

    describe('createBasicColumnDefinition', () => {

        it('returns checkbox column', () => {
            expect(createBasicColumnDefinition('key', true)).toEqual({
                id: 'key',
                field: 'key',
                title: 'key',
                editor: 'checkbox',
                elementType: 'BOOLEAN',
                formatter: expect.any(Function),
                sorter: 'boolean'}
            );
        });
        it('returns numeric column', () => {
            expect(createBasicColumnDefinition('key', 123)).toEqual({
                id: 'key',
                field: 'key',
                title: 'key',
                editor: 'input',
                elementType: 'INTEGER',
                cssClass: 'numeric',
                sorter: 'number'}
            );
        });
        it('returns string column', () => {
            expect(createBasicColumnDefinition('key', 'abc')).toEqual({
                id: 'key',
                field: 'key',
                title: 'key',
                editor: 'input',
                elementType: 'STRING',
                sorter: 'string'}
            );
        });
    });
 describe('removePropsNotInApprovedList', () => {

        it('returns valid column', () => {
            const column = {
                id: 'key',
                field: 'key',
                title: 'key',
                editor: 'checkbox',
                elementType: 'BOOLEAN',
                formatter: expect.any(Function),
                sorter: 'boolean'}
            expect(removePropsNotInApprovedList(column)).toEqual(column);
        });

     it('remove unapproved props', () => {
         const column = {
             id: 'key',
             field: 'key',
             raul: 'jimenez',
             };
         expect(removePropsNotInApprovedList(column)).toEqual(
             {
                 id: 'key',
                 field: 'key'
             }
         );
     });

    });

});
