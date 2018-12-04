const _ = require('lodash');
const fs = require('fs');
const stringify = require('csv-stringify');

const START_NUM = 111110;

// pos counts from the right
function column(pos, num) {
    return Math.floor((num % (10 ** (pos + 1))) / (10 ** (pos)));
}

function randomBool() {
    return '' + _.sample([true, false]);
}

function randomReal() {
    return _.random(true);
}

function randomString() {
    return _.random(true).toString(36).substring(2, 15) + _.random(true).toString(36).substring(2, 15);
}

function randomInt() {
    return _.random(0,256^2);
}

class Table {
    constructor(fns, filename, headers, numRows, startNum) {
        this.funcs = fns;
        this.filename = filename;
        this.headers = headers;
        this.numRows = numRows;
        this.startNum = startNum;
    }
}

let tables = {};

tables['table1'] = new Table([
    // 5 indices
    _.partial(column, 4),
    _.partial(column, 3),
    _.partial(column, 2),
    _.partial(column, 1),
    _.partial(column, 0),

    // 6 columns
    _.partial(column, 0),
    _.partial(column, 1),
    _.partial(column, 2),
    _.partial(column, 3),
    randomInt,
    randomBool
], 'table1', [
    'IndexA',
    'IndexB',
    'IndexC',
    'IndexD',
    'IndexE',

    'Col1',
    'Col2',
    'Col3',
    'Col4',
    'Col5',
    'Col6',
], 2000, 11110);

tables['table2'] = new Table([
    // 6 indices
    _.partial(column, 5),
    _.partial(column, 4),
    _.partial(column, 3),
    _.partial(column, 2),
    _.partial(column, 1),
    _.partial(column, 0),

    // 3 columns
    randomReal,
    randomBool,
    randomString,
    randomInt
], 'table2', [
    'IndexA',
    'IndexB',
    'IndexC',
    'IndexD',
    'IndexE',
    'IndexF',

    'Col1',
    'Col2',
    'Col3',
    'Col4',
], 10000, 111110);

tables['table3'] = new Table([
    // 6 indices
    _.partial(column, 5),
    _.partial(column, 4),
    _.partial(column, 3),
    _.partial(column, 2),
    _.partial(column, 1),
    _.partial(column, 0),

    // 3 columns
    randomReal,
    randomBool,
    randomString,
    randomInt
], 'table3', [
    'IndexA',
    'IndexB',
    'IndexC',
    'IndexD',
    'IndexE',
    'IndexF',

    'Col1',
    'Col2',
    'Col3',
    'Col4',
], 100000, 111110);

tables['table4'] = new Table([
    // 6 indices
    _.partial(column, 5),
    _.partial(column, 4),
    _.partial(column, 3),
    _.partial(column, 2),
    _.partial(column, 1),
    _.partial(column, 0),

    // 3 columns
    randomReal,
    randomBool,
    randomString,
    randomInt
], 'table4', [
    'IndexA',
    'IndexB',
    'IndexC',
    'IndexD',
    'IndexE',
    'IndexF',

    'Col1',
    'Col2',
    'Col3',
    'Col4',
], 500000, 111110);

tables['table5'] = new Table([
    // 6 indices
    _.partial(column, 5),
    _.partial(column, 4),
    _.partial(column, 3),
    _.partial(column, 2),
    _.partial(column, 1),
    _.partial(column, 0),

    // 3 columns
    randomReal,
    randomBool,
    randomString,
    randomInt
], 'table5', [
    'IndexA',
    'IndexB',
    'IndexC',
    'IndexD',
    'IndexE',
    'IndexF',

    'Col1',
    'Col2',
    'Col3',
    'Col4',
], 1000000, 111110);

let table;

for(var i=1; i < 6; i++) {
    table = tables[`table${i}`];

    console.log(`Generating data for table${i}`, table);

    let rows = _.map(_.range(0, table.numRows - 1), (idx) => {
        let num = table.startNum + idx;
        let funcs = table.funcs;
        let row = _.map(funcs, (fn, key) => {
            return fn(num);
        });
        return row;
    })

    // add in the header row
    rows.unshift(table.headers);

    let output = stringify(rows);

    fs.writeFileSync('insight/model_resources/' + table.filename + '.csv', output, 'utf8', () => {
        console.log('finished! ' + table.filename);
    });

    console.log(rows.length);
}