import transform from '../../../src/js/vdlx-pivotgrid/transform'
import {extensionApiMock, componentParamsBuilder} from '../../jest/mocks/extension-api-mock'

import {CUSTOM_COLUMN_DEFINITION} from "../../../src/js/constants";

describe('vdlx-pivotgrid: transform', () => {

    let mockElement;
    let apiMock;
    let transformFunction;
    let attrs;
    beforeEach(() => {

        mockElement = {
            classList: {
                add: jest.fn()
            },
            setAttribute: jest.fn(),
            removeAttribute: jest.fn()
        };

        attrs = {
            data: {
                name: 'data',
                expression: {value: 'data'}
            },
            'row-set-position': {
                name: 'pivotRowPositions',
                expression: {
                    isString: false,
                    value: 'pivotRowPositions'
                }
            },
            'row-dimensions': {
                name: 'pivotRowDimensions',
                expression: {
                    isString: false,
                    value: 'pivotRowDimensions'
                }
            },
            'row-titles': {
                name: 'pivotRowTitles',
                expression: {
                    isString: false,
                    value: 'pivotRowTitles'
                }
            },
            'column-set-position': {
                name: 'pivotColumnPositions',
                expression: {
                    isString: false,
                    value: 'pivotColumnPositions'
                }
            },
            'column-dimensions': {
                name: 'pivotColumnDimensions',
                expression: {
                    isString: false,
                    value: 'pivotColumnDimensions'
                }
            },
            'column-titles': {
                name: 'pivotColumnTitles',
                expression: {
                    isString: false,
                    value: 'pivotColumnTitles'
                }
            }
        };

        apiMock = extensionApiMock;
        transformFunction = transform;
    });


    it('gets the params builder', () => {
        transformFunction(mockElement, attrs, apiMock);
        // gets getComponentParamsBuilder from the api
        expect(apiMock.getComponentParamsBuilder).toBeCalledWith(mockElement);
    });

    it('sets default attrs', () => {
        transformFunction(mockElement, attrs, apiMock);

        // sets column definition type
        expect(componentParamsBuilder.addParam).toBeCalledWith(
            'columnDefinitionType', CUSTOM_COLUMN_DEFINITION.PIVOT, false
        );

    });

    describe('row attributes', () => {
        it('throws error when no row attrs set', () => {
            attrs['row-set-position'] = undefined;
            attrs['row-dimensions'] = undefined;
            expect(() => {
                transformFunction(mockElement, attrs, apiMock);
            }).toThrow('Error for component vdlx-pivotgrid: Missing row configuration.  Please specify either "row-set-position" or "row-dimensions".');
        });

        it('sets rows attrs', () => {

            transformFunction(mockElement, attrs, apiMock);

            // sets column definition type
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                'columnDefinitionType', CUSTOM_COLUMN_DEFINITION.PIVOT, false
            );

            // sets the data attr
            expect(componentParamsBuilder.addFunctionOrExpressionParam).toBeCalledWith(
                attrs.data.name, attrs.data.expression.value, ['value']
            );

            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['row-set-position'].name, attrs['row-set-position'].expression.value, true
            );

            // sets the pivotRowDimensions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['row-dimensions'].name, attrs['row-dimensions'].expression.value, true
            );

            // sets the pivotRowTitles attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['row-titles'].name, attrs['row-titles'].expression.value, true
            );

        });


        it('row-filter set when expression', () => {
            attrs['row-filter'] = {
                name: 'rowFilter',
                expression: {
                    isString: false,
                    value: 'something',
                }
            };

            transformFunction(mockElement, attrs, apiMock);
            // not called when pageSize cannot be converted to a number
            expect(componentParamsBuilder.addFunctionOrExpressionParam).toBeCalledWith(
                attrs['row-filter'].name, attrs['row-filter'].expression.value, ['rowData', 'indices']
            );
        });

        it('row-filter throws error when not expression', () => {
            attrs['row-filter'] = {
                    name: 'rowFilter',
                    expression: {
                        isString: true,
                        value: 'something',
                    }
            };

            expect(() => {
                transformFunction(mockElement, attrs, apiMock);
            }).toThrow('Error for component vdlx-pivotgrid: \"row-filter\" attribute must be supplied as an expression');

        });


    });
    describe('column attributes', () => {
        it('throws error when no column attrs set', () => {
            attrs['column-set-position'] = undefined;
            attrs['column-dimensions'] = undefined;
            expect(() => {
                transformFunction(mockElement, attrs, apiMock);
            }).toThrow('Error for component vdlx-pivotgrid: Missing column configuration.  Please specify either "column-set-position" or "column-dimensions".');
        });

        it('sets column attrs', () => {

            transformFunction(mockElement, attrs, apiMock);

            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['column-set-position'].name, attrs['column-set-position'].expression.value, true
            );

            // sets the pivotRowDimensions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['column-dimensions'].name, attrs['column-dimensions'].expression.value, true
            );

            // sets the pivotRowTitles attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['column-titles'].name, attrs['column-titles'].expression.value, true
            );

        });

    });


    describe('page attrs', () => {
        it('sets page size', () => {
            attrs['page-size'] = {

                name: 'pageSize',
                rawValue: 100,
                expression: {isString: true}

            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['page-size'].name, attrs['page-size'].rawValue);
        });

        it('converts page size attr to number and sets', () => {
            attrs['page-size'] = {
                name: 'pageSize',
                rawValue: '100',
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['page-size'].name, 100);

        });

        it('does not set non numeric page size', () => {
            attrs['page-size'] = {
                name: 'pageSize',
                rawValue: 'one hundred',
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // not called when pageSize cannot be converted to a number
            expect(componentParamsBuilder.addParam).not.toBeCalledWith(attrs['page-size'].name, attrs['page-size'].rawValue);
        });

        it('sets pagination attrs', () => {
            attrs['page-mode'] = {
                name: 'pageMode',
                rawValue: 'paged'
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['page-mode'].name, attrs['page-mode'].rawValue);
        });

        it('sets default pagination attrs', () => {
            transformFunction(mockElement, attrs, apiMock);
            // sets pageMode
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                'pageMode', 'scrolling'
            );
        });
    });

    describe('export attributes', () => {

        it('sets show export when true', () => {
            attrs['show-export'] = {
                name: 'showExport',
                rawValue: {toUpperCase: jest.fn(() => 'TRUE')},
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['show-export'].name, true, false);
        });

        it('sets show export when false', () => {
            attrs['show-export'] = {
                name: 'showExport',
                rawValue: {toUpperCase: jest.fn(() => 'not true')},
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['show-export'].name, false, false);
        });

        it('export-filename set with expression', () => {
            attrs['export-filename'] = {
                name: 'exportFilename',
                expression: {
                    isString: false,
                    value: 'abc.123',
                }
            };

            transformFunction(mockElement, attrs, apiMock);
            // not called when pageSize cannot be converted to a number
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['export-filename'].name, attrs['export-filename'].expression.value, true
            );
        });

        it('export-filename set with raw value', () => {
            attrs['export-filename'] = {
                name: 'exportFilename',
                rawValue: 'abc.123',
                expression: {
                    isString: true
                }
            };

            transformFunction(mockElement, attrs, apiMock);
            // not called when pageSize cannot be converted to a number
            expect(componentParamsBuilder.addParam).toBeCalledWith(
                attrs['export-filename'].name, attrs['export-filename'].rawValue, false
            );
        });

    });

    describe('decoration attributes', () => {

        it('nulls id on element and sets as param', () => {
            attrs['id'] = {
                name: 'tableId',
                rawValue: 'my-table-id'
            };

            transformFunction(mockElement, attrs, apiMock);
            // nulls the element id
            expect(mockElement.setAttribute).toBeCalledWith('id', '');
            // sets tableId
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['id'].name, attrs['id'].rawValue);
        });

        it('sets width', () => {
            attrs['width'] = {
                name: 'width',
                rawValue: '100'
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets width
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['width'].name, attrs['width'].rawValue);
        });

        it('removes class on element and sets as param', () => {
            attrs['class'] = {
                name: 'class',
                rawValue: 'class-one'
            };

            transformFunction(mockElement, attrs, apiMock);
            // nulls the element id
            expect(mockElement.removeAttribute).toBeCalledWith('class');
            // sets tableId
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['class'].name, attrs['class'].rawValue);
        });

        it('sets always-show-selection when true', () => {
            attrs['always-show-selection'] = {
                name: 'alwaysShowSelection',
                rawValue: {toUpperCase: jest.fn(() => 'TRUE')},
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets the pivotRowPositions attr
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['always-show-selection'].name, true);
        });

        it('sets height as string', () => {
            attrs['height'] = {
                name: 'gridHeight',
                rawValue: '100',
                expression: {isString: true}
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets width
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['height'].name, attrs['height'].rawValue, false);
        });

        it('sets height as expression', () => {
            attrs['height'] = {
                name: 'gridHeight',
                expression: {
                    isString: false,
                    value: '100'
                }
            };

            transformFunction(mockElement, attrs, apiMock);
            // sets width
            expect(componentParamsBuilder.addParam).toBeCalledWith(attrs['height'].name, attrs['height'].expression.value, true);
        });


    });

});
