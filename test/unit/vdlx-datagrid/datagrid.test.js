import {getCssClasses, modifyColumns} from '../../../src/js/vdlx-datagrid/datagrid';
import {EDITOR_TYPES} from '../../../src/js/constants';

describe('datagrid getCssClasses', () => {
    let result;

    describe('when called with index column', function () {
        beforeEach(function () {
            result = getCssClasses({}, false, true);
        });

        it('should include the index class', function () {
            expect(result).toEqual('index');
        });
    });

    describe('when called with numeric column', function () {
        beforeEach(function () {
            result = getCssClasses({}, true);
        });

        it('should include the numeric class', function () {
            expect(result).toEqual('numeric');
        });
    });

    describe('when column editor type is select', function () {
        beforeEach(function () {
            result = getCssClasses(
                {editorType: EDITOR_TYPES.select},
                false);
        });

        it('should include the select-editor class', function () {
            expect(result).toEqual('select-editor');
        });
    });

    describe('when custom column classes are defined', function () {
        it('should include the custom classes', function () {
            result = getCssClasses(
                {style: 'my-class another-class and-another'},
                false);
            expect(result).toEqual('my-class another-class and-another');
        });

        it('should trim whitespace around each class', function () {
            result = getCssClasses(
                {style: " \t\n\nmy-class\nanother-class \t  and-another\t\n    "},
                false);
            expect(result).toEqual('my-class another-class and-another');
        });
    });

    describe('when multiple options add classes', function () {
        beforeEach(function () {
            result = getCssClasses(
                {
                    editorType: EDITOR_TYPES.select,
                    style: ' my-class-2    and-another-2  '
                },
                true,
                true);
        });

        it('should include all classes concatenated', function () {
            expect(result).toEqual('index numeric select-editor my-class-2 and-another-2');
        });

        it('custom classes should be at the end of the list', function () {
            expect(result.endsWith('my-class-2 and-another-2')).toBeTruthy();
        });
    });

    describe('when column style resolves to a number', function () {
        beforeEach(function () {
            result = getCssClasses(
                {
                    style: 123
                },
                false);
        });

        it('should handle the number and use it as the class name', function () {
            expect(result).toEqual('123');
        });
    });
});

describe('modifyColumns', () => {

    let columns;
    beforeEach(() => {
        columns = [{a: 1}];
    });

    it('calls the user defined modifier', function () {
        const columnModifier = jest.fn();
        modifyColumns(columnModifier, columns);
        expect(columnModifier).toHaveBeenCalledTimes(1);
        expect(columnModifier).toHaveBeenCalledWith(columns);
    });

    it('returns modified columns', function () {

        const columnModifier = (cols) => {
            cols[0].b = 2;
            return cols;
        };

        expect(modifyColumns(columnModifier, columns)).toEqual([{a: 1, b: 2}]);
    });

    it('logs error when modifier not a function', () => {
        const columnModifier = 666;
        modifyColumns(columnModifier, columns)
        expect(global.console.error).toBeCalledWith(
            expect.stringContaining('Error for component vdlx-datagrid: column-modifier" attribute must be a function.')
        );
    });

});
