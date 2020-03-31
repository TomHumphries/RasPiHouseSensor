const path = require('path');

module.exports.BuildFilepath = (signalName, filename, year, month, day) => {
    let filepath = this.BuildDateDirectory(signalName, year, month, day);
    filepath = path.join(filepath, filename);
    return filepath;
}
module.exports.BuildDateDirectory = (signalName, year, month, day) => {
    let filepath = path.join(__dirname, 'data', signalName);
    if (year) {
        filepath = path.join(filepath, add_zero(year, 4));
        if (month) {
            filepath = path.join(filepath, add_zero(month));
            if (day) {
                filepath = path.join(filepath, add_zero(day));
            }
        }
    }
    return filepath;
}

function add_zero(your_number, length = 2) {
    var num = '' + your_number;
    while (num.length < length) {
        num = '0' + num;
    }
    return num;
}