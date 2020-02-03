import {chooseColumnFilter} from '../../../src/js/vdlx-datagrid/grid-filters';
import {Enums} from '../../../src/js/vdlx-datagrid/grid-filters';
import {insight} from "../../../src/js/insight-globals";

describe('vdlx-datagrid grid-filters', () => {

    beforeEach(() => {

        insight.Formatter = {
            formatNumber: (d, fmt) => {
                if(!!fmt) {
                    if((typeof fmt) === 'string') {
                        return fmt;
                    }
                    return fmt(d);
                }
                return '' + d;
            },
            format: {
                integer: '#,##0',
                decimal: '#,##0.0###'
            }
        }
    });

    /*
    Nothing defined on the filter results in undefined being returned by choose column filter.
     */
    it('chooseColumnFilter with nothing', () => {
        var filter = chooseColumnFilter({});
        expect(filter).toBeUndefined();
    });

    describe('check formatters', () => {
        /*
        Check that something is returned when passing an elementType that has a corresponding column filter.
         */
        [Enums.DataType.INTEGER, Enums.DataType.REAL, Enums.DataType.STRING].forEach(elementType => {
            it(`chooseColumnFilter with elementType as ${elementType}`, () => {
                var filter = chooseColumnFilter({
                    elementType: elementType
                });
                expect(filter).toBeDefined();
            });
        });

        /*
        Check that undefined is returned when passing an elementType that doesn't have a corresponding column filter.
         */
        [Enums.DataType.CONSTRAINT, Enums.DataType.DECISION_VARIABLE].forEach(elementType => {
            it(`chooseColumnFilter with elementType as ${elementType}`, () => {
                var filter = chooseColumnFilter({
                    elementType: elementType
                });
                expect(filter).toBeUndefined();
            });
        });
    });


    describe('Partial match', () => {
        describe('Integer type', () => {
            it('chooseColumnFilter call it with a matching integer', () => {
                const column = {
                    elementType: Enums.DataType.INTEGER
                };
                const filter = chooseColumnFilter(column);
                const result = filter("2", 2);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching integer', () => {
                var column = {
                    elementType: Enums.DataType.INTEGER,
                    format: n => n
                };
                var filter = chooseColumnFilter(column);
                var result = filter("3", 2);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching integer but formatted version matches', () => {
                var column = {
                    elementType: Enums.DataType.INTEGER,
                    displayType: Enums.DataType.INTEGER,
                    format: n => "3"
                };
                var filter = chooseColumnFilter(column);
                var result = filter("3", 2);
                expect(result).toBeTruthy();
            });
        });

        describe('Real type', () => {
            it('chooseColumnFilter call it with a matching real', () => {
                var column = {
                    elementType: Enums.DataType.REAL
                };
                var filter = chooseColumnFilter(column);
                var result = filter("2", 2.6);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching real', () => {
                var column = {
                    elementType: Enums.DataType.REAL,
                    format: n => n
                };
                var filter = chooseColumnFilter(column);
                var result = filter("3", 2.5);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching real but formatted version matches', () => {
                var column = {
                    elementType: Enums.DataType.REAL,
                    format: '2.5'
                };
                var filter = chooseColumnFilter(column);
                var result = filter("2.5", 99);
                expect(result).toBeTruthy();
            });
        });

        describe('String type', () => {
            it('chooseColumnFilter call it with a matching string', () => {
                var column = {
                    elementType: Enums.DataType.STRING
                };
                var filter = chooseColumnFilter(column);
                var result = filter("2", "2.6");
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a matching empty string', () => {
                var column = {
                    elementType: Enums.DataType.STRING
                };
                var filter = chooseColumnFilter(column);
                var result = filter('', '');
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching string', () => {
                var column = {
                    elementType: Enums.DataType.STRING,
                    format: n => n
                };
                var filter = chooseColumnFilter(column);
                var result = filter("3", 2.5);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('Exact match', () => {
        describe('Integer type', () => {
            it('chooseColumnFilter call it with a matching integer', () => {
                const column = {
                    elementType: Enums.DataType.INTEGER,
                    format: undefined
                };
                const filter = chooseColumnFilter(column);
                const result = filter("=20", 20);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching integer', () => {
                var column = {
                    elementType: Enums.DataType.INTEGER
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=3", 2);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching integer but formatted version matches', () => {
                var column = {
                    elementType: Enums.DataType.INTEGER,
                    format: '3'
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=3", 2);
                expect(result).toBeTruthy();
            });
        });

        describe('Real type', () => {
            it('chooseColumnFilter call it with a matching real', () => {
                var column = {
                    elementType: Enums.DataType.REAL
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=2", 2.6);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching real', () => {
                var column = {
                    elementType: Enums.DataType.REAL,
                    format: n => n
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=3", 2.5);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching real but formatted version matches', () => {
                var column = {
                    elementType: Enums.DataType.REAL,
                    format: '2.5'
                };

                var filter = chooseColumnFilter(column);
                var result = filter("=2.5", 99);
                expect(result).toBeTruthy();
            });
        });

        describe('String type', () => {
            it('chooseColumnFilter call it with a matching string', () => {
                var column = {
                    elementType: Enums.DataType.STRING
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=2.6", "2.6");
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching string', () => {
                var column = {
                    elementType: Enums.DataType.STRING,
                    format: n => n
                };
                var filter = chooseColumnFilter(column);
                var result = filter("=3", 2.5);
                expect(result).toBeFalsy();
            });
        });
    });

    describe("Range operators", () => {

        const matchesAgainst = (col, searchTerm, data) => {
            const filter = chooseColumnFilter(col);
            const result = filter(searchTerm, data);
            return result;
        };

        describe('Integer types', () => {
            const column = {
                elementType: Enums.DataType.INTEGER
            };

            describe('Greater than', () => {
                it('4 >3', () => {
                    const result = matchesAgainst(column, ">3", 4);
                    expect(result).toBeTruthy();
                });

                it('3 is not >3', () => {
                    const result = matchesAgainst(column, ">3", 3);
                    expect(result).toBeFalsy();
                });
            });

            describe('Greater than or equal to', () => {
                it('4 >=3', () => {
                    const result = matchesAgainst(column, ">=3", 4);
                    expect(result).toBeTruthy();
                });

                it('3 >=3', () => {
                    const result = matchesAgainst(column, ">=3", 3);
                    expect(result).toBeTruthy();
                });

                it('2 is not >=3', () => {
                    const result = matchesAgainst(column, ">=3", 2);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than', () => {
                it('2 <3', () => {
                    const result = matchesAgainst(column, "<3", 2);
                    expect(result).toBeTruthy();
                });

                it('3 is not <3', () => {
                    const result = matchesAgainst(column, "<3", 3);
                    expect(result).toBeFalsy();
                });

                it('4 is not <3', () => {
                    const result = matchesAgainst(column, "<3", 4);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than or equal to', () => {
                it('2 <=3', () => {
                    const result = matchesAgainst(column, "<=3", 2);
                    expect(result).toBeTruthy();
                });

                it('3 <=3', () => {
                    const result = matchesAgainst(column, "<=3", 3);
                    expect(result).toBeTruthy();
                });

                it('4 is not <=3', () => {
                    const result = matchesAgainst(column, "<=3", 4);
                    expect(result).toBeFalsy();
                });
            });

            describe('Not equal to', () => {
                it('2 <>3', () => {
                    const result = matchesAgainst(column, "<>3", 2);
                    expect(result).toBeTruthy();
                });

                it('3 does not <>3', () => {
                    const result = matchesAgainst(column, "<>3", 3);
                    expect(result).toBeFalsy();
                });

                it('4 <>3', () => {
                    const result = matchesAgainst(column, "<>3", 4);
                    expect(result).toBeTruthy();
                });
                it('2 !=3', () => {
                    const result = matchesAgainst(column, "!=3", 2);
                    expect(result).toBeTruthy();
                });

                it('3 does not !=3', () => {
                    const result = matchesAgainst(column, "!=3", 3);
                    expect(result).toBeFalsy();
                });

                it('4 !=3', () => {
                    const result = matchesAgainst(column, "!=3", 4);
                    expect(result).toBeTruthy();
                });
            });

            describe('Wrong syntax', () => {
                it('4 does not match ! =3', () => {
                    const result = matchesAgainst(column, "! =3", 4);
                    expect(result).toBeFalsy();
                });
                it('4 does not match ! =4', () => {
                    const result = matchesAgainst(column, "! =4", 4);
                    expect(result).toBeFalsy();
                });

                it('4 does not match " =3"', () => {
                    const result = matchesAgainst(column, " =3", 4);
                    expect(result).toBeFalsy();
                });
                it('4 does not match " =4"', () => {
                    const result = matchesAgainst(column, " =4", 4);
                    expect(result).toBeFalsy();
                });

                it('4 does not match ">%3"', () => {
                    const result = matchesAgainst(column, ">%3", 4);
                    expect(result).toBeFalsy();
                });
                it('3 does not match "< >4"', () => {
                    const result = matchesAgainst(column, "< >4", 3);
                    expect(result).toBeFalsy();
                });

                it('3 does not match "!==4"', () => {
                    const result = matchesAgainst(column, "!==4", 3);
                    expect(result).toBeFalsy();
                });

            });
        });

        describe('Real types', () => {
            const column = {
                elementType: Enums.DataType.REAL
            };

            describe('Greater than', () => {
                it('3.5 >3.49', () => {
                    const result = matchesAgainst(column, '>3.49', 3.5);
                    expect(result).toBeTruthy();
                });

                it('3.0 is not >3.01', () => {
                    const result = matchesAgainst(column, '>3.01', 3.0);
                    expect(result).toBeFalsy();
                });
            });

            describe('Greater than or equal to', () => {
                it('3.09 >=3', () => {
                    const result = matchesAgainst(column, '>=3', 3.09);
                    expect(result).toBeTruthy();
                });

                it('3.002 >=3.001', () => {
                    const result = matchesAgainst(column, '>=3.001', 3.002);
                    expect(result).toBeTruthy();
                });

                it('3.00 is not >=3.00001', () => {
                    const result = matchesAgainst(column, '>=3.0001', 3.00);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than', () => {
                it('2.9999 <3', () => {
                    const result = matchesAgainst(column, '<3', 2.9999);
                    expect(result).toBeTruthy();
                });

                it('3.0 is not <3', () => {
                    const result = matchesAgainst(column, '<3', 3.0);
                    expect(result).toBeFalsy();
                });

                it('3.00001 is not <3', () => {
                    const result = matchesAgainst(column, '<3', 3.00001);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than or equal to', () => {
                it('2.999999 <=3', () => {
                    const result = matchesAgainst(column, '<=3', 2.999999);
                    expect(result).toBeTruthy();
                });

                it('3.000000 <=3.00001', () => {
                    const result = matchesAgainst(column, '<=3.00001', 3.0000000);
                    expect(result).toBeTruthy();
                });

                it('3.0002 is not <=3.00001', () => {
                    const result = matchesAgainst(column, '<=3.00001', 3.0002);
                    expect(result).toBeFalsy();
                });
            });

            describe('Not equal to', () => {
                it('2.99 <>3', () => {
                    const result = matchesAgainst(column, '<>3', 2.99);
                    expect(result).toBeTruthy();
                });

                it('3.0001 <>3', () => {
                    const result = matchesAgainst(column, '<>3', 3.0001);
                    expect(result).toBeTruthy();
                });

                it('3.99999 does not  <>3.99999', () => {
                    const result = matchesAgainst(column, '<>3.99999', 3.99999);
                    expect(result).toBeFalsy();
                });
                it('2.999 !=3', () => {
                    const result = matchesAgainst(column, '!=3', 2.999);
                    expect(result).toBeTruthy();
                });

                it('3.1234 does not !=3.1234', () => {
                    const result = matchesAgainst(column, '!=3.1234', 3.1234);
                    expect(result).toBeFalsy();
                });

                it('3.000001 !=3', () => {
                    const result = matchesAgainst(column, '!=3.000001', 3);
                    expect(result).toBeTruthy();
                });
            });

        });
    })
});

