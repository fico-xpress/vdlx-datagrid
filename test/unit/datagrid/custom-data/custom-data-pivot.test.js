import {
    pivotDataModule,
    getLabelByProperty,
    ColHashMap,
    isTotalsRowComponent,
    // used for mocking up internal functions
    pivotDataUtils, DataColGenerator
} from '../../../../src/js/datagrid/custom-data/custom-data-pivot';
import cloneDeep from "lodash/cloneDeep";

describe('custom data pivot.js', function () {

    describe('error handling', () => {

        it("error thrown when calling run without configuration options", () => {
            expect(pivotDataModule.run).toBeInstanceOf(Function)
            expect(() => {
                pivotDataModule.run();
            }).toThrow('Error for pivotDataModule: Configuration is unset.');
        })

    })

    describe("DataColGenerator", function () {

        let dataKeys = [ ["a","c2"], ["a","c1"], ["b","c2"], ["b","c1"] ]
        let keys = {  }

        beforeEach( () => {
                dataKeys.forEach((l,i) => keys[l] = [ {key: l, idx: i} ])
            }
        )

        it("sort", () => {
            let colSorter = new DataColGenerator();
            let labels = []
            let cols = []
            let expRes = [ {title:"a", columns: [
                { title: "c1", field: "1"}, {title: "c2", field: "0"} ] },
                { title: "b", columns: [
                    {title: "c1", field: "3"}, {title: "c2", field: "2" } ]
                } ]
            colSorter._getLabelByProperty = (lvl,val) => val
            colSorter.createTreeKey(keys)
            let res = colSorter.recurse()
            expect(JSON.stringify(res)).toEqual(JSON.stringify(expRes));
        })

        it("labeling", () => {
            let colSorter = new DataColGenerator();
            let labels = { Key_ab: { "c1": "C1", "c2": "C2"}, Key_01: { "a": "AA", "b": "BB"} }
            let cols = [ "Key_01", "Key_ab" ]
            let expRes = [ {title:"AA", columns: [
                { title: "C1", field: "1"}, {title: "C2", field: "0"} ] },
                { title: "BB", columns: [
                    {title: "C1", field: "3"}, {title: "C2", field: "2" } ]
                } ]
            colSorter.createTreeKey(keys)
            let res = colSorter.recurse(labels,cols)
            expect(JSON.stringify(res)).toEqual(JSON.stringify(expRes));
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
            // default computes aggregation for cols and rows
            expect(config.enableTotals).toEqual(pivotDataModule.OptionEnums.EnableTotals.All)
            // default aggregation function is sum
            expect(config.aggregationTotals).toEqual(pivotDataModule.totalsFun.sum.name)
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
            'min-All':    [1,2,2,2,1,"Totals (min)"],
            'min-Cols':   [1,2,2,2,"Totals (min)"],
            'sum-All':    [4,2,2,6,14,"Totals (sum)"],
            'sum-Cols':   [4,2,2,6,"Totals (sum)"],
            'max-All':    [3,2,2,4,4,"Totals (max)"],
            'max-Cols':   [3,2,2,4,"Totals (max)"],
            'count-All':  [2,1,1,2,6,"Totals (count)"],
            'count-Cols': [2,1,1,2,"Totals (count)"],
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
                        pivotDataUtils.computeTotals(pivotData, pivotOptions,undefined)
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
            config = cloneDeep(_config)
            data = cloneDeep(_data)

            // check if the import worked correctly
            expect(pivotDataModule.run).toBeInstanceOf(Function)

        })

        beforeEach( () => {
            config = cloneDeep(_config)
            data = cloneDeep(_data)
        })

        describe('complete configuration without totals calculation', function () {
            let output
            beforeAll( () => {
                config.aggregationTotals = ''
                config.layout = 'compact'
                output = pivotDataModule.run(data, config)
            } )

            it('can create default column definition', function () {
                const expResult = [
                    {
                        title: "ColKey1",  columns: [
                            {
                                title: "ColKey2",  columns: [
                                    {title: "RowKey1", field: "0", cssClass: "pivot-row-header"},
                                    {title: "RowKey2", field: "1", cssClass: "pivot-row-header"}
                                ]
                            }
                        ]
                    },
                    {
                        title: "c1",  columns: [
                            {title: "10", field: "2"},
                            {title: "20", field: "3"}
                        ]
                    },
                    {
                        title: "c2",  columns: [
                            {title: "10", field: "4"},
                            {title: "20", field: "5"}
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

        describe('layout', function () {

            it('compact layout no totals', function () {
                let output
                config.aggregationTotals = ''
                config.layout = 'compact'
                output = pivotDataModule.run(data, config)
                const expColDef = [
                    {
                        title: "ColKey1",  columns: [
                            {
                                title: "ColKey2",  columns: [
                                    {title: "RowKey1", field: "0", cssClass: "pivot-row-header"},
                                    {title: "RowKey2", field: "1", cssClass: "pivot-row-header"}
                                ]
                            }
                        ]
                    },
                    {
                        title: "c1",  columns: [
                            {title: "10", field: "2"},
                            {title: "20", field: "3"}
                        ]
                    },
                    {
                        title: "c2",  columns: [
                            {title: "10", field: "4"},
                            {title: "20", field: "5"}
                        ]
                    }
                ]
                const expData = [
                    {"0": "a", "1": "x", "2": 1, "3": 2, "4": 2, "5": 2},
                    {"0": "b", "1": "x", "2": 3},
                    {"0": "b", "1": "y", "5": 4},
                ]

                const actualColDef = output.cols
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expColDef))

                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expData))
            })

            it.skip('normal layout no totals', function () {
                let output
                config.aggregationTotals = ''
                config.layout = 'normal' // any...
                output = pivotDataModule.run(data, config)
                const expColDef = [
                    { title: "", columns: [
                            {
                                title: "", columns: [
                                    {title: "RowKey1", field: "0", cssClass: "pivot-row-header"},
                                    {title: "RowKey2", field: "1", cssClass: "pivot-row-header"},
                                ]
                            }
                        ]
                    },
                    { title: "ColKey1",
                        columns: [ {title: "ColKey2", columns: [
                                {title: "", field: "__empty", cssClass: "pivot-row-header", headerSort: false} ] } ] },
                    { title: "c1", columns: [ {title: "10", field: "2"}, {title: "20", field: "3"} ] },
                    { title: "c2", columns: [ {title: "10", field: "4"}, {title: "20", field: "5"} ] }
                ]
                const expData = [
                    {"0": "a", "1": "x", "2": 1, "3": 2, "4": 2, "5": 2},
                    {"0": "b", "1": "x", "2": 3},
                    {"0": "b", "1": "y", "5": 4},
                ]

                const actualColDef = output.cols
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expColDef))

                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expData))
            })

        })

        describe('complete configuration with builtin totals calculation', function () {

            let output
            beforeAll( () => {
                config.aggregationTotals = 'count'
                config.enableTotals = 'all'
                config.layout = 'compact'
                output = pivotDataModule.run(data, config)
            } )

            it('can create default column definition', function () {
                const expResult = [
                    { title: "ColKey1", columns: [ {
                            title: "ColKey2",  columns: [
                                {title: "RowKey1", field: "0", cssClass: "pivot-row-header"},
                                {title: "RowKey2", field: "1", cssClass: "pivot-row-header"}
                            ] }
                        ] },
                    { title: "c1",  columns: [ {title: "10", field: "2"}, {title: "20", field: "3"} ] },
                    { title: "c2",  columns: [ {title: "10", field: "4"}, {title: "20", field: "5"} ] },
                    { title: "Totals (count)", field: "__totals", cssClass: "tabulator-frozen" }
                ]
                const actualColDef = output.cols
                expect(JSON.stringify(actualColDef)).toEqual(JSON.stringify(expResult))
            })

            it('can pivot the original data (count)', function () {
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
                        cssClass: "tabulator-calcs-bottom"
                    }
                ]
                const actualData = output.data
                expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expResult))
            })
        })

        describe('complete configuration with duplicate keys', function() {

            it('can pivot the original data (sum)', function () {
                data.push( data[0] );
                // sum: 2+5 = 6
                config.aggregationTotals = ''
                config.aggregationValues = 'sum'
                config.layout = 'compact'
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

            beforeEach( () => {
                config.layout = 'compact'
            })

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

            beforeEach( () => {
                config.layout = 'compact';
            })

            it('should apply labels', function() {
                config.labels = { 0: { "a": "Accept", "b": "Reject" },
                    1: { "x": "X", "y": "Y" },
                    3: { "10": "USD 10", "20": "USD 20"} }
                const output = pivotDataModule.run(data, config)
                const actualColDef = output.cols
                const actualData = output.data
                const expColDef = [ { title:"ColKey1",columns: [
                        {title:"ColKey2",columns: [
                                {title:"RowKey1",field:"0",cssClass:"pivot-row-header"},
                                {title:"RowKey2",field:"1",cssClass:"pivot-row-header"}
                            ] }
                    ] },
                    {title:"c1",columns: [ {title:"USD 10",field:"2"}, {title:"USD 20",field:"3"} ] },
                    {title:"c2",columns: [ {title:"USD 10",field:"4"}, {title:"USD 20",field:"5"} ] },
                    {title:"Totals (sum)",field:"__totals",cssClass:"tabulator-frozen"}
                ]
                const expData = [
                    {"0":"Accept","1":"X","2":1,"3":2,"4":2,"5":2,"__totals":7},
                    {"0":"Reject","1":"X","2":3,"__totals":3},
                    {"0":"Reject","1":"Y","5":4,"__totals":4},
                    {"1":"Totals (sum)","2":4,"3":2,"4":2,"5":6,"__totals":14,cssClass:"tabulator-calcs-bottom"}]
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
                    config.layout = 'compact'
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

        const inputData = [
            ['simple', 'tabulator-calcs-bottom', true],
            ['multiple', 'tabulator-calcs-bottom another-class', true],
            ['bad syntax begin hyphen', '-tabulator-calcs-bottom', false],
            ['bad syntax end hyphen', 'tabulator-calcs-bottom-', false],
            ['good syntax begin space', ' tabulator-calcs-bottom', true],
            ['good syntax end space', 'tabulator-calcs-bottom ', true],
            ['data row', '', false],
            ['other row', 'a b c d', false]
        ]

        describe(`isTotalsRowComponent`,() => {
            inputData.forEach( (r) => {
                it(`returns ${r[2]} when css-class is ${r[0]}`, function () {
                    let row =  { getData: () => { return {cssClass: r[1]}} };
                    expect(isTotalsRowComponent(row)).toBe(r[2]);
                })
            })
        })

        /**
         * Sorting only supported for data row. In these tests we will verify the
         * custom sorting function only applies to row data.
         */
        let expInputDataSorting = [
            [ true, true, false ],
            [ true, false, false ],
            [ false, true, false ],
            [ false, false, true ]
        ];

        let sortFunction = [
            ['numeric', pivotDataUtils.customNumericSorter, [ [ 100, 200, -100],  [ 200, 100, 100] ] ],
            ['string',  pivotDataUtils.customStringSorter,  [ [ 'a', 'b', -1 ], [ 'b', 'a', 1] ] ]
        ];

        sortFunction.forEach( (f) => {
            describe(`${f[0]} sorting`,() => {
                expInputDataSorting.forEach( (r) => {
                    describe(`totals:${r[0]} | totals:${r[1]}`, () => {
                        beforeEach( () => {
                            jest.spyOn( pivotDataUtils, 'isTotalsRowComponent').mockImplementation( (arg) => {
                                return (arg === 'left row') ? r[0] : r[1]
                            })
                        })
                        f[2].forEach( (v) => {
                            it(`compare ${v[0]} and ${v[1]} = ${v[2]}`, () => {
                                let sortOk = r[2];
                                let sortFn = f[1];
                                let result = sortFn(v[0], v[1], 'left row', 'right row');
                                if (sortOk) {
                                    expect(result).not.toBeNull();
                                    expect(result).toEqual(v[2]);
                                } else {
                                    expect(result).toBeNull();
                                }
                            })
                        })
                    })
                })
            })
        });
    })
})
