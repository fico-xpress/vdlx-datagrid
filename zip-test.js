let _ = require('lodash');

// console.log(_.map(_.range(1000000), _.random));

let num_columns = 12;
let num_rows = 8;

let data = _.map(_.range(num_columns), () => _.range(num_rows));
let data2 = _.map(_.range(num_columns), () => _.range(num_rows));
let data3 = _.map(_.range(num_columns), () => _.range(num_rows));

let fields = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(0, num_columns).split('');
let result, result2, result3;

// console.log(data);
// console.log(data2);

let num_times = 1000;

console.time('ex1');
_.times(num_times, () => {
    result = _.map(_.zip.apply(undefined, data), function (row) {
        return _.zipObject(fields, row);
    });
});
console.timeEnd('ex1');

console.time('ex2');
_.times(num_times, () => {

    result2 = [];
    let rowSize = data2[0].length;
    for (let j = 0; j < rowSize; j++) {
        let colData = {};
        for (let i = 0; i < data2.length; i++) {
            let row = data2[i];
            colData[fields[i]] = row[j];
        }
        result2.push(colData);
    }

});
console.timeEnd('ex2');

/**
 * @param Array<Array<Any>> dat rows of values
 * @param Array<String> flds field names
 * @returns {Array}
 */
function pivotObject(dat, flds) {
    let rslt = [];
    let datLength = dat.length;
    let rowSize = dat[0].length;
    for (let j = 0; j < rowSize; j++) {
        let colData = {};
        for (let i = 0; i < datLength; i++) {
            let row = dat[i];
            colData[flds[i]] = row[j];
        }
        rslt.push(colData);
    }
    return rslt;
}

console.time('ex3');
_.times(num_times, () => {
    result3 = pivotObject(data3, fields);
});
console.timeEnd('ex3');


//
// console.log(result);

// console.log(result2);
console.log(result3);