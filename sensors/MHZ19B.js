var CronJob = require('cron').CronJob;

let sensor;

Initialise();

var job = new CronJob('* * * * *', function () {
    takeReading();
}, null, true, null);
job.start();

function takeReading() {
    try {
        sensor.readCO2();
    } catch (error) {
        console.log('Error taking MH-Z19B reading');
    }
}

async function Initialise() {
    try {
        console.log('INITIALISING MH-Z19B CO2 SENSOR');
        const MHZ19B = require('mh-z19b');
        sensor = new MHZ19B();
    } catch (error) {
        console.log('Error initialising MH-Z19B sensor', error);
    }
}

module.exports = sensor;