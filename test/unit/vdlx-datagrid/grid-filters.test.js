import { chooseColumnFilter } from '../../../src/js/datagrid/grid-filters';
import { Enums } from '../../../src/js/datagrid/grid-filters';
import { insightGetter } from '../../../src/js/insight-modules';

/*
Rules for grid filters

Exact Match - starts with =
    Strings - matches with entire string
    Numeric - matches with whole underlying value

Partial Match
    Strings - matches with part of string
    Numeric - matches with part of underlying number as string match

Range Operator Match - starts with > >= < <= <> !=
    Strings - No match
    Numeric - matches with operator against underlying value
 */

describe('vdlx-datagrid grid-filters', () => {
    beforeEach(() => {
        insightGetter().Formatter = {
            formatNumber: (d, fmt) => {
                if (!!fmt) {
                    if (typeof fmt === 'string') {
                        return fmt;
                    }
                    return fmt(d);
                }
                return '' + d;
            },
            format: {
                integer: '#,##0',
                decimal: '#,##0.0###',
            },
        };
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
        [Enums.DataType.INTEGER, Enums.DataType.REAL, Enums.DataType.STRING].forEach((elementType) => {
            it(`chooseColumnFilter with elementType as ${elementType}`, () => {
                var filter = chooseColumnFilter({
                    elementType: elementType,
                });
                expect(filter).toBeDefined();
            });
        });

        /*
        Check that undefined is returned when passing an elementType that doesn't have a corresponding column filter.
         */
        [Enums.DataType.CONSTRAINT, Enums.DataType.DECISION_VARIABLE].forEach((elementType) => {
            it(`chooseColumnFilter with elementType as ${elementType}`, () => {
                var filter = chooseColumnFilter({
                    elementType: elementType,
                });
                expect(filter).toBeUndefined();
            });
        });
    });

    describe('Partial match', () => {
        describe('Integer type', () => {
            const column = {
                id: 'id1',
                elementType: Enums.DataType.INTEGER,
            };
            it('chooseColumnFilter call it with a matching integer', () => {
                const rowData = {
                    id1: 2,
                };
                const filter = chooseColumnFilter(column);
                const result = filter('2', 2, rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a matching large integer', () => {
                const rowData = {
                    id1: 12345678,
                };
                const filter = chooseColumnFilter(column);
                const result = filter('12345678', 12345678, rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching integer', () => {
                const rowData = {
                    id1: 2,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('3', 2, rowData);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching integer but formatted version matches', () => {
                // var column = {
                //     elementType: Enums.DataType.INTEGER,
                //     displayType: Enums.DataType.INTEGER,
                //     format: n => "3"
                // };
                const rowData = {
                    id1: 2,
                };
                column.format = (n) => $`G${n}`;
                var filter = chooseColumnFilter(column);
                var result = filter('3', 2, rowData);
                expect(result).toBeFalsy();
            });
        });

        describe('Real type', () => {
            var column = {
                id: 'id1',
                elementType: Enums.DataType.REAL,
            };
            it('chooseColumnFilter call it with a matching real', () => {
                const rowData = {
                    id1: 2.6,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('2', 2.6, rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching real', () => {
                const rowData = {
                    id1: 2.5,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('3', 2.5, rowData);
                expect(result).toBeFalsy();
            });
            it('chooseColumnFilter call it with a non-matching real but formatted version matches', () => {
                const rowData = {
                    id1: 99,
                };
                column.format = '2.5';
                var filter = chooseColumnFilter(column);
                var result = filter('2.5', 99, rowData);
                expect(result).toBeFalsy();
            });
        });

        describe('String type', () => {
            var column = {
                id: 'id1',
                elementType: Enums.DataType.STRING,
            };
            it('chooseColumnFilter call it with a matching string', () => {
                const rowData = {
                    id1: '2Be',
                };
                var filter = chooseColumnFilter(column);
                var result = filter('2', '2Be', rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a matching empty string', () => {
                const rowData = {
                    id1: '',
                };
                var filter = chooseColumnFilter(column);
                var result = filter('', '', rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching string', () => {
                const rowData = {
                    id1: 'art',
                };
                var filter = chooseColumnFilter(column);
                var result = filter('3', 'art', rowData);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('Exact match', () => {
        describe('Integer type', () => {
            const column = {
                id: 'id1',
                elementType: Enums.DataType.INTEGER,
            };
            it('chooseColumnFilter call it with a matching integer', () => {
                const rowData = {
                    id1: 20,
                };
                const filter = chooseColumnFilter(column);
                const result = filter('=20', 20, rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching integer', () => {
                const rowData = {
                    id1: 2,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('=3', 2, rowData);
                expect(result).toBeFalsy();
            });
        });

        describe('Real type', () => {
            let column = {
                id: 'id1',
                elementType: Enums.DataType.REAL,
            };

            it('chooseColumnFilter call it with a matching real', () => {
                const rowData = {
                    id1: 2.6,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('=2.6', 2.6, rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching real', () => {
                const rowData = {
                    id1: 2.5,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('=3', 2.5, rowData);
                expect(result).toBeFalsy();
            });
        });

        describe('String type', () => {
            var column = {
                id: 'id1',
                elementType: Enums.DataType.STRING,
            };
            it('chooseColumnFilter call it with a matching string', () => {
                const rowData = {
                    id1: '2.6',
                };
                var filter = chooseColumnFilter(column);
                var result = filter('=2.6', '2.6', rowData);
                expect(result).toBeTruthy();
            });
            it('chooseColumnFilter call it with a non-matching string', () => {
                const rowData = {
                    id1: 2.5,
                };
                var filter = chooseColumnFilter(column);
                var result = filter('=3', 2.5, rowData);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('Range operators', () => {
        const matchesAgainst = (col, searchTerm, data, rowData) => {
            const filter = chooseColumnFilter(col);
            const result = filter(searchTerm, data, rowData);
            return result;
        };

        const expectMatch = (column, searchText, cellData, rowData) => {
            const result = matchesAgainst(column, searchText, cellData, rowData);
            expect(result).toBeTruthy();
        };

        const expectNoMatch = (column, searchText, cellData, rowData) => {
            const result = matchesAgainst(column, searchText, cellData, rowData);
            expect(result).toBeFalsy();
        };

        describe('Integer types', () => {
            const column = {
                id: 'id1',
                elementType: Enums.DataType.INTEGER,
                format: undefined,
            };

            describe('match', () => {
                const matchComparisons = [
                    // Greater than
                    ['>3', 4],
                    ['>1000', 1001],
                    ['>-3', -2],
                    ['>-1001', -1000],

                    // Greater than or equal to
                    ['>=3', 3],
                    ['>=3', 4],

                    //Less than
                    ['<3', 2],
                    ['<1001', 1000],
                    ['<-3', -4],
                    ['<-1000', -1001],

                    // Less than or equal to
                    ['<=3', 3],
                    ['<=3', 2],
                    ['<=1000', 1000],
                    ['<=1000', 999],

                    // Not equal to
                    ['<>3', 2],
                    ['<>1000', 999],
                ];
                matchComparisons.forEach(([searchText, cellData]) => {
                    it(`${searchText} matches ${cellData}`, () => {
                        let rowData = {
                            id1: cellData,
                        };
                        expectMatch(column, searchText, cellData, rowData);
                    });
                });
            });

            describe("doesn't match", () => {
                [
                    ['>3', 3],
                    ['>1000', 1000],
                    ['>-3', -3],
                    ['>-1000', -1000],

                    ['>=3', 2],
                    ['>=3001', 3000],
                    ['>=-3', -4],
                    ['>=-3000', -3001],

                    //Less than
                    ['<3', 4],
                    ['<1000', 1000],
                    ['<-3', -3],
                    ['<-1000', -1000],

                    // Less than or equal to
                    ['<=3', 4],
                    ['<=3', 500],
                    ['<=1000', 1001],
                    ['<=1000', 9999],

                    // Not equal to
                    ['<>3', 3],
                    ['<>1000', 1000],
                    ['!=3', 3],
                    ['!=1000', 1000],

                    // Wrong syntax
                    ['! =3', 4],
                    ['! =4', 4],

                    // wrong syntax
                    ['!==4', 4],
                    ['!=%4', 4],
                    ['!=%4', 3],
                    ['<>bodkin', 3],
                ].forEach(([searchText, cellData]) => {
                    it(`${searchText} no match ${cellData}`, () => {
                        let rowData = {
                            id1: cellData,
                        };
                        expectNoMatch(column, searchText, cellData, rowData);
                    });
                });
            });

            describe('Wrong syntax', () => {
                it('4 does not match ! =3', () => {
                    let rowData = {
                        id1: 4,
                    };
                    const result = matchesAgainst(column, '! =3', 4, rowData);
                    expect(result).toBeFalsy();
                });
                it('4 does not match ! =4', () => {
                    let rowData = {
                        id1: 4,
                    };
                    const result = matchesAgainst(column, '! =4', 4, rowData);
                    expect(result).toBeFalsy();
                });

                it('4 does not match " =3"', () => {
                    let rowData = {
                        id1: 4,
                    };
                    const result = matchesAgainst(column, ' =3', 4, rowData);
                    expect(result).toBeFalsy();
                });
                it('4 does not match " =4"', () => {
                    let rowData = {
                        id1: 4,
                    };
                    const result = matchesAgainst(column, ' =4', 4, rowData);
                    expect(result).toBeFalsy();
                });

                it('4 does not match ">%3"', () => {
                    let rowData = {
                        id1: 4,
                    };
                    const result = matchesAgainst(column, '>%3', 4, rowData);
                    expect(result).toBeFalsy();
                });
                it('3 does not match "< >4"', () => {
                    let rowData = {
                        id1: 3,
                    };
                    const result = matchesAgainst(column, '< >4', 3, rowData);
                    expect(result).toBeFalsy();
                });

                it('3 does not match "!==4"', () => {
                    let rowData = {
                        id1: 3,
                    };
                    const result = matchesAgainst(column, '!==4', 3, rowData);
                    expect(result).toBeFalsy();
                });
            });
        });

        describe('Real types', () => {
            const column = {
                id: 'id1',
                elementType: Enums.DataType.REAL,
            };

            describe('match', () => {
                const matchComparisons = [
                    // Greater than
                    ['>3.99', 4.0],
                    ['>1000.99999', 1001],
                    ['>-3', -2.999],
                    ['>-1001', -1000.9999999999],

                    // Greater than or equal to
                    ['>=3.0000001', 3.0000001],
                    ['>=3.9999999', 4],

                    //Less than
                    ['<3', 2.99999999],
                    ['<1001', 1000.999999],
                    ['<-3.999999', -4],
                    ['<-1000.99999', -1001],

                    // Less than or equal to
                    ['<=3.1', 3.1],
                    ['<=3', 2.9999999999999],
                    ['<=1000.000001', 1000],
                    ['<=1000', 999.9999999],

                    // Not equal to
                    ['<>3.0', 3.000000000001],
                    ['<>1000.0001', 1000],
                ];
                matchComparisons.forEach(([searchText, cellData]) => {
                    it(`${searchText} matches ${cellData}`, () => {
                        let rowData = {
                            id1: cellData,
                        };
                        expectMatch(column, searchText, cellData, rowData);
                    });
                });
            });

            describe("doesn't match", () => {
                [
                    ['>3.000000001', 3],
                    ['>1000.0000001', 1000.00000000001],
                    ['>-3.0001', -3.0001],
                    ['>-1000.9999', -1000.9999],

                    ['>=3.000001', 3.0000001],
                    ['>=300.999999991', 300.99999999],
                    ['>=-3', -4],
                    ['>=-3000', -3001],

                    //Less than
                    ['<3', 4],
                    ['<1000', 1000],
                    ['<-3', -3],
                    ['<-1000', -1000],

                    // Less than or equal to
                    ['<=3', 4],
                    ['<=3', 500],
                    ['<=1000', 1001],
                    ['<=1000', 9999],

                    // Not equal to
                    ['<>3', 3],
                    ['<>1000', 1000],
                    ['!=3', 3],
                    ['!=1000', 1000],

                    // Wrong syntax
                    ['! =3', 4],
                    ['! =4', 4],

                    // wrong syntax
                    ['!==4', 4],
                    ['!=%4', 4],
                    ['!=%4', 3],
                    ['<>bodkin', 3],
                ].forEach(([searchText, cellData]) => {
                    it(`${searchText} no match ${cellData}`, () => {
                        let rowData = {
                            id1: cellData,
                        };
                        expectNoMatch(column, searchText, cellData, rowData);
                    });
                });
            });

            describe('Greater than', () => {
                it('3.5 >3.49', () => {
                    let rowData = {
                        id1: 3.5,
                    };
                    const result = matchesAgainst(column, '>3.49', 3.5, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.0 is not >3.01', () => {
                    let rowData = {
                        id1: 3.0,
                    };
                    const result = matchesAgainst(column, '>3.01', 3.0, rowData);
                    expect(result).toBeFalsy();
                });
            });

            describe('Greater than or equal to', () => {
                it('3.09 >=3', () => {
                    let rowData = {
                        id1: 3.09,
                    };
                    const result = matchesAgainst(column, '>=3', 3.09, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.002 >=3.001', () => {
                    let rowData = {
                        id1: 3.002,
                    };
                    const result = matchesAgainst(column, '>=3.001', 3.002, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.00 is not >=3.00001', () => {
                    let rowData = {
                        id1: 3.0,
                    };
                    const result = matchesAgainst(column, '>=3.0001', 3.0, rowData);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than', () => {
                it('2.9999 <3', () => {
                    let rowData = {
                        id1: 2.9999,
                    };
                    const result = matchesAgainst(column, '<3', 2.9999, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.0 is not <3', () => {
                    let rowData = {
                        id1: 3.0,
                    };
                    const result = matchesAgainst(column, '<3', 3.0, rowData);
                    expect(result).toBeFalsy();
                });

                it('3.00001 is not <3', () => {
                    let rowData = {
                        id1: 3.00001,
                    };
                    const result = matchesAgainst(column, '<3', 3.00001, rowData);
                    expect(result).toBeFalsy();
                });
            });

            describe('Less than or equal to', () => {
                it('2.999999 <=3', () => {
                    let rowData = {
                        id1: 2.999999,
                    };
                    const result = matchesAgainst(column, '<=3', 2.999999, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.000000 <=3.00001', () => {
                    let rowData = {
                        id1: 3.0,
                    };
                    const result = matchesAgainst(column, '<=3.00001', 3.0, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.0002 is not <=3.00001', () => {
                    let rowData = {
                        id1: 3.0002,
                    };
                    const result = matchesAgainst(column, '<=3.00001', 3.0002, rowData);
                    expect(result).toBeFalsy();
                });
            });

            describe('Not equal to', () => {
                it('2.99 <>3', () => {
                    let rowData = {
                        id1: 2.99,
                    };
                    const result = matchesAgainst(column, '<>3', 2.99, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.0001 <>3', () => {
                    let rowData = {
                        id1: 3.0001,
                    };
                    const result = matchesAgainst(column, '<>3', 3.0001, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.99999 does not  <>3.99999', () => {
                    let rowData = {
                        id1: 3.99999,
                    };
                    const result = matchesAgainst(column, '<>3.99999', 3.99999, rowData);
                    expect(result).toBeFalsy();
                });
                it('2.999 !=3', () => {
                    let rowData = {
                        id1: 2.999,
                    };
                    const result = matchesAgainst(column, '!=3', 2.999, rowData);
                    expect(result).toBeTruthy();
                });

                it('3.1234 does not !=3.1234', () => {
                    let rowData = {
                        id1: 3.1234,
                    };
                    const result = matchesAgainst(column, '!=3.1234', 3.1234, rowData);
                    expect(result).toBeFalsy();
                });

                it('3.000001 !=3', () => {
                    let rowData = {
                        id1: 3,
                    };
                    const result = matchesAgainst(column, '!=3.000001', 3, rowData);
                    expect(result).toBeTruthy();
                });
            });
        });
    });
});
