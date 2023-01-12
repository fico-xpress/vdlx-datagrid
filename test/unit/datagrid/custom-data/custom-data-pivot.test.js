import {
    pivotDataModule,
    ColHashMap,
    getLabelByProperty,
    computeTotals, customNumericSorter, customStringSorter, isTotalsRowComponent
} from '../../../../src/js/datagrid/custom-data/custom-data-pivot';
import _ from "lodash";

describe('custom data pivot.js', function () {

    describe('error handling', () => {

        it("error thrown when calling run without configuration options", () => {
            expect(pivotDataModule.run).toBeInstanceOf(Function)
            expect(() => {
                pivotDataModule.run();
            }).toThrow('Error for pivotDataModule: Configuration is unset.');
        })

    })

    /**
     * Verify the behavior of the hashmap that is used to map each row of the original data
     * set to columns and rows of the pivoted table.
     */
    describe('ColHashMap', function () {
        describe("no collision", function () {
            let m = new ColHashMap()
            const expOutput = {
                "1,2":
                    [{"key": [1, 2], "idx": 0}]
            }

            it("has expected internal structure", function () {
                m.add([1, 2])
                m.add([1, 2])
                expect(JSON.stringify(m.buckets)).toEqual(JSON.stringify(expOutput))
            })

            it("can get value", function () {
                const idxHit = m.get([1, 2])
                expect(idxHit.idx).toEqual(0)

                const idxMiss = m.get(["1,2"])
                expect(idxMiss).toEqual(undefined)
            })
        })

        describe("with collision", function () {
            let m = new ColHashMap()
            const expOutput = {
                "1,2":
                    [{"key": ["1", "2"], "idx": 0}, {"key": ["1,2"], "idx": 1}]
            }
            m.add(["1", "2"])
            m.add(["1,2"])

            it("has expected internal structure", function () {
                expect(JSON.stringify(m.buckets)).toEqual(JSON.stringify(expOutput))
            })

            it("can get value", function () {
                const testKey = [[1, 2], ["1", "2"], ["1,2"]]
                const expIdx = [undefined, {idx: 0}, {idx: 1}]
                testKey.forEach((e, i) => {
                    const idx = m.get(e)
                    const expObj = expIdx[i]
                    if (expObj !== undefined) {
                        expect(idx.idx).toEqual(expIdx[i].idx)
                    } else {
                        expect(idx).toEqual(expIdx[i])
                    }
                })
            })
        })

    })

    describe('getLabelByProperty', function() {
        it("should return expected value", function () {
            let labels = {1: {"x": "X"}}
            let keys = [99, 'x', 123]
            let expLabels = [99, 'X', 123]
            expLabels.forEach((e, i) => {
                expect(getLabelByProperty(labels[i], keys[i])).toEqual(e)
            })
        })
    })

    /**
     * The below group of tests asserts the behavior of the aggregation function itself
     */
    describe('totalsFun', function() {
        it('should have default options as expected', function () {
            const config = new pivotDataModule.Options()
            expect(config.enableTotals).toEqual(pivotDataModule.OptionEnums.EnableTotals.All)
            expect(config.aggregationTotals).toEqual(pivotDataModule.totalsFun.count.name)
        })

        it('should calculate totals of totals only if rows and cols totals are available', function () {
            const inputData = [
                // Non numeric cases
                ["sum|min|max", undefined, 10, 10],
                ["sum|min|max", undefined, undefined, undefined],
                ["sum|min|max", 10, undefined, 10],
                ["sum|min|max", NaN, 10, 10],
                ["sum|min|max", 10, NaN, 10],
                ["sum|min|max", null, 10, 10],
                ["sum|min|max", 10, null, 10],
                ["sum", 1, 2, 3],
                ["min", 1, 2, 1], ["min", 3, 2, 2],
                ["max", 1, 2, 2], ["max", 3, 4, 4],
                ["count", 1, null, 1], ["count", null, 1, 1],
                ["count", 1, NaN, 1], ["count", NaN, 1, 1],
                ["count", 1, undefined, 1], ["count", undefined, 1, 1],
                ["count", 1, "", 2], ["count", "", 1, "1"],
                ["count", 123, 456, 124],
            ]
            inputData.forEach((row) => {
                row[0].split("|").forEach((fName) => {
                    let e
                    if (fName === "*") {
                        e = Object.entries(pivotDataModule.totalsFun)
                    } else {
                        e = [[fName, pivotDataModule.totalsFun[fName]]]
                    }
                    e.forEach((f) =>
                        expect(f[1](row[1], row[2])).toEqual(row[3]))
                })
            })
        })
    })

    /**
     * The below group of tests assert the behavior of the totals calculation
     */
    describe("computeTotals", function() {
        let pivotOptions
        let pivotData
        const expRowTotals = {
            'min-All':  [1,3,4,1],
            'min-Rows': [1,3,4],
            'sum-All':  [7,3,4,14],
            'sum-Rows': [7,3,4],
            'max-All':  [2,3,4,4],
            'max-Rows': [2,3,4],
            'count-All':  [4,1,1,6],
            'count-Rows': [4,1,1],
        }
        const expColTotals = {
            'min-All':  ["Totals (min)",1,2,2,2,1],
            'min-Cols': ["Totals (min)",1,2,2,2],
            'sum-All':  ["Totals (sum)",4,2,2,6,14],
            'sum-Cols': ["Totals (sum)",4,2,2,6],
            'max-All':  ["Totals (max)",3,2,2,4,4],
            'max-Cols': ["Totals (max)",3,2,2,4],
            'count-All':  ["Totals (count)",2,1,1,2,6],
            'count-Cols': ["Totals (count)",2,1,1,2],
        }

        beforeEach( () => {
            pivotOptions = {
                rows: [0, 1],
                cols: [2, 3],
                header: ['RowKey1', 'RowKey2', 'ColKey1', 'ColKey2']
            };

            pivotData = [
                // row keys         |           values              |
                {"0": "a", "1": "x", "2": 1, "3": 2, "4": 2, "5": 2},
                {"0": "b", "1": "x", "2": 3},
                {"0": "b", "1": "y",                         "5": 4}]
        })

        for(const f in pivotDataModule.totalsFun) {
            for (const o in pivotDataModule.OptionEnums.EnableTotals) {
                it(`should calculate valid ${o} totals with ${f}`,
                    function () {
                        pivotOptions.enableTotals = pivotDataModule.OptionEnums.EnableTotals[o]
                        pivotOptions.aggregationTotals = f
                        computeTotals(pivotData, pivotOptions,undefined)
                        // extract only the totals
                        let rowTotals = pivotData.map(e => e.__totals)
                        let colTotals = (pivotData[3] !== undefined) ? Object.values(pivotData[3]).slice(0,-1) : undefined
                        let k = `${f}-${o}`
                        let dd = [{msg: "row totals",    expected: expRowTotals, actual: rowTotals},
                                  {msg: "column totals", expected: expColTotals, actual: colTotals}]
                        // Check the values are correct
                        dd.forEach(d => {
                            if (d.expected[k] !== undefined) {
                                expect(d.actual).toEqual(d.expected[k])
                            } else if (d.actual !== undefined) {
                                d.actual.every(e => expect(e).toBeUndefined())
                            }
                        })
                    })
            }
        }
    })

    describe('pivotDataModel.run', function () {

        /**
         * @type {Options}
         */
        let _config

        let config

        let _data

        let data

        /**
         * Note here the original data is rather simple with all
         * columns used and ordered in a convenient way
         */
        beforeAll( () => {
            _config = new pivotDataModule.Options({ rows: [0, 1],
                cols: [2, 3],
                header: [ 'RowKey1', 'RowKey2', 'ColKey1', 'ColKey2'] });

            _data = [ { key: ["a","x","c1","10"], value: 1},
                { key: ["a","x","c1","20"], value: 2},
                { key: ["a","x","c2","10"], value: 2},
                { key: ["a","x","c2","20"], value: 2},
                { key: ["b","x","c1","10"], value: 3},
                { key: ["b","y","c2","20"], value: 4} ];

            // so config and data can be used in beforeAll too...
            config = _.cloneDeep(_config)
            data = _.cloneDeep(_data)

            // check if the import worked correctly
            expect(pivotDataModule.run).toBeInstanceOf(Function)

        })

        beforeEach( () => {
            config = _.cloneDeep(_config)
            data = _.cloneDeep(_data)
        })

        describe('complete configuration without totals calculation', function () {
            let output
            beforeAll( () => {
                config.aggregationTotals = ''
                output = pivotDataModule.run(data, config)
            } )

            it('can create default column definition', function () {
                const expResult = [
                    {
                        "title": "ColKey1", "level": 0, "columns": [
                            {
                                "title": "ColKey2", "level": 1, "columns": [
                                    {"title": "RowKey1", "field": "0", "cssClass": "pivot-row-header"},
                                    {"title": "RowKey2", "field": "1", "cssClass": "pivot-row-header"}
                                ]
                            }
                        ]
                    },
                    {
                        "title": "c1", "level": 0, "columns": [
                            {"title": "10", "field": "2"},
                            {"title": "20", "field": "3"}
                        ]
                    },
                    {
                        "title": "c2", "level": 0, "columns": [
                            {"title": "10", "field": "4"},
                            {"title": "20", "field": "5"}
                        ]
                    }
                ]
                const actualColDef = output.cols
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expResult))
            })

            it('can pivot the original data', function () {
                const expResult = [
                    {"0": "a", "1": "x", "2": 1, "3": 2, "4": 2, "5": 2},
                    {"0": "b", "1": "x", "2": 3},
                    {"0": "b", "1": "y", "5": 4},
                ]
                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expResult))
            })

        })

        describe('complete configuration with builtin totals calculation', function () {

            let output
            beforeAll( () => {
                expect(config.aggregationTotals).toEqual('count')
                expect(config.enableTotals).toEqual('all')
                output = pivotDataModule.run(data, config)
            } )

            it('can create default column definition', function () {
                const expResult = [
                    {
                        "title": "ColKey1", "level": 0, "columns": [
                            {
                                "title": "ColKey2", "level": 1, "columns": [
                                    {"title": "RowKey1", "field": "0", "cssClass": "pivot-row-header"},
                                    {"title": "RowKey2", "field": "1", "cssClass": "pivot-row-header"}
                                ]
                            }
                        ]
                    },
                    {
                        "title": "c1", "level": 0, "columns": [
                            {"title": "10", "field": "2"},
                            {"title": "20", "field": "3"}
                        ]
                    },
                    {
                        "title": "c2", "level": 0, "columns": [
                            {"title": "10", "field": "4"},
                            {"title": "20", "field": "5"}
                        ]
                    },
                    {"title": "Totals (count)", "field": "__totals", "cssClass": "tabulator-frozen"}
                ]
                const actualColDef = output.cols
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expResult))
            })

            it('can pivot the original data', function () {
                const expResult = [
                    {"0": "a", "1": "x", "2": 1, "3": 2, "4": 2, "5": 2, "__totals": 4},
                    {"0": "b", "1": "x", "2": 3,                         "__totals": 1},
                    {"0": "b", "1": "y",                         "5": 4, "__totals": 1},
                    {
                        "1": "Totals (count)",
                        "2": 2,
                        "3": 1,
                        "4": 1,
                        "5": 2,
                        "__totals": 6,
                        "cssClass": "tabulator-calcs-bottom"
                    }
                ]
                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expResult))
            })
        })

        describe('complete configuration with duplicate keys', function() {

            it('can pivot the original data', function () {
                data.push( data[0] );
                // sum: 2+5 = 6
                config.aggregationTotals = ''
                config.aggregationValues = 'sum'
                const output = pivotDataModule.run(data, config);
                const expResult = [
                    {"0": "a", "1": "x", "2": 2 /* was 1 */, "3": 2, "4": 2, "5": 2},
                    {"0": "b", "1": "x", "2": 3},
                    {"0": "b", "1": "y",                         "5": 4},
                ]
                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expResult))
            })

        })

        describe('row and column headers', function () {

            let getHeaders = (c) => [
                    c[0].title, // 2
                    c[0].columns[0].title, // 3
                    c[0].columns[0].columns[0].title, // 0
                    c[0].columns[0].columns[1].title, // 1
                    c[1].title, // c1
                    c[1].columns[0].title, // 10
                    c[1].columns[1].title, // 20
                    c[2].title, // c2
                    c[2].columns[0].title, // 10
                    c[2].columns[1].title, // 20
                ]

            it('should generate default header when config.header is not set', function () {
                config.header = undefined
                const output = pivotDataModule.run(data, config)
                const c = output.cols
                const expHeader = ["","","","","c1","10","20","c2","10","20"]
                const actualHeader = getHeaders(c)
                expect(actualHeader).toEqual(expHeader)
            })

            it('should apply custom header when config.header is set', function () {
                config.header = [undefined, "custom-header1", undefined, "custom-header2" ]
                const output = pivotDataModule.run(data, config)
                const c = output.cols
                const expHeader = ["","custom-header2","","custom-header1","c1","10","20","c2","10","20"]
                const actualHeader = getHeaders(c)
                expect(actualHeader).toEqual(expHeader)
            })
        })

        describe('labels', function() {
            it('should apply labels', function() {
                config.labels = { 0: { "a": "Accept", "b": "Reject" },
                        1: { "x": "X", "y": "Y" },
                        3: { "10": "USD 10", "20": "USD 20"} }
                const output = pivotDataModule.run(data, config)
                const actualColDef = output.cols
                const actualData = output.data
                const expColDef = [ { "title":"ColKey1","level":0,"columns": [
                        {"title":"ColKey2","level":1,"columns": [
                                {"title":"RowKey1","field":"0","cssClass":"pivot-row-header"},
                                {"title":"RowKey2","field":"1","cssClass":"pivot-row-header"}
                            ] }
                    ] },
                    {"title":"c1","level":0,"columns": [ {"title":"USD 10","field":"2"}, {"title":"USD 20","field":"3"} ] },
                    {"title":"c2","level":0,"columns": [ {"title":"USD 10","field":"4"}, {"title":"USD 20","field":"5"} ] },
                    {"title":"Totals (count)","field":"__totals","cssClass":"tabulator-frozen"}
                ]
                const expData = [{"0":"Accept","1":"X","2":1,"3":2,"4":2,"5":2,"__totals":4},
                    {"0":"Reject","1":"X","2":3,"__totals":1},
                    {"0":"Reject","1":"Y","5":4,"__totals":1},
                    {"1":"Totals (count)","2":2,"3":1,"4":1,"5":2,"__totals":6,"cssClass":"tabulator-calcs-bottom"}]
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expData))
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expColDef))
            })
        })

        Object.keys(pivotDataModule.totalsFun).forEach((f) => {
            const expResult = {
                sum:   [7, 3, 4, 14],
                count: [4, 1, 1, 6],
                min:   [1, 3, 4, 1],
                max:   [2, 3, 4, 4]
            }

            const expTitle = `Totals (${f})`

            let output

            describe(`aggregation ${f}`, function () {

                beforeEach( () => {
                    config.aggregationTotals = f
                    output = pivotDataModule.run(data, config)
                } )

                it(`can add "${expTitle}" to column definition`, function () {
                    const actualColDef = output.cols
                    expect(actualColDef[3].title).toEqual(expTitle)
                });

                it(`can calculate row totals using "${f}"`, function () {
                    const actualData = output.data.map((e) => e.__totals)
                    expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expResult[f]))
                });
            })
        })

    });


    describe(`custom sorting functions`,() => {

        let totalRowSingleClass;
        let totalRowMultipleClass;
        let dataRow;
        let otherRow;

        beforeEach( () => {
            totalRowSingleClass = {
                getData: () => {
                    return {cssClass: 'tabulator-calcs-bottom'};
                }
            };
            totalRowMultipleClass = {
                getData: () => {
                    return {cssClass: 'tabulator-calcs-bottom another-class'};
                }
            };
            dataRow = {
                getData: () => {
                    return {cssClass: ''};
                }
            };
            otherRow = {
                getData: () => {
                    return {cssClass: 'a b c d'};
                }
            };
        });

        describe(`isTotalsRowComponent`,() => {
            it('returns true when css-class is string', function() {
                expect(isTotalsRowComponent(totalRowSingleClass)).toBeTruthy();
            });
            it('returns true when css-class is space delimited list', function() {
                expect(isTotalsRowComponent(totalRowMultipleClass)).toBeTruthy();
            });
            it('returns false when css is empty', function() {
                expect(isTotalsRowComponent(dataRow)).toBeFalsy();
            });
            it('returns false when css is list but total not present', function() {
                expect(isTotalsRowComponent(otherRow)).toBeFalsy();
            });
        });

        describe(`numeric sorting`,() => {
            it('does not sort total row a - single css', function() {
                expect(customNumericSorter(100, 200, totalRowSingleClass, dataRow)).toBeNull();
            });
            it('does not sort total row b - single css', function() {
                expect(customNumericSorter(100, 200, dataRow, totalRowSingleClass)).toBeNull();
            });
            it('does not sort total row a - multi css', function() {
                expect(customNumericSorter(100, 200, totalRowMultipleClass, dataRow)).toBeNull();
            });
            it('does not sort total row b- multi css', function() {
                expect(customNumericSorter(100, 200, dataRow, totalRowMultipleClass)).toBeNull();
            });
            it('sorts non total rows no css', function() {
                expect(customNumericSorter(100, 200, dataRow, dataRow)).not.toBeNull();
            });
            it('sorts non total rows contains css', function() {
                expect(customNumericSorter(100, 200, otherRow, otherRow)).not.toBeNull();
            });
        });

        describe(`string sorting`,() => {
            it('does not sort total row a - single css', function() {
                expect(customStringSorter('a', 'b', totalRowSingleClass, dataRow)).toBeNull();
            });
            it('does not sort total row b - single css', function() {
                expect(customStringSorter('a', 'b', dataRow, totalRowSingleClass)).toBeNull();
            });
            it('does not sort total row a - multi css', function() {
                expect(customStringSorter('a', 'b', totalRowMultipleClass, dataRow)).toBeNull();
            });
            it('does not sort total row b- multi css', function() {
                expect(customStringSorter('a', 'b', dataRow, totalRowMultipleClass)).toBeNull();
            });
            it('sorts non total rows', function() {
                expect(customStringSorter('a', 'b', dataRow, dataRow)).not.toBeNull();
            });
            it('sorts non total rows contains css', function() {
                expect(customStringSorter('a', 'b', otherRow, otherRow)).not.toBeNull();
            });
        });
    });
})
