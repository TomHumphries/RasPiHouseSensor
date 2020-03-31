const portPath = '/dev/ttyUSB0';
let sensor;

Initialise();

async function Initialise() {
    try {
        const SDS011Client = require('sds011-wrapper');
        sensor = new SDS011Client(portPath);
        console.log('INITIALISING SDS011 PARTICULATE SENSOR');
        await sensor.setReportingMode('active') // take readings autonomously
        console.log('SDS011 reporting mode set to "active"');
        await sensor.setWorkingPeriod(5); // take a reading every 5 minutes
        console.log('SDS011 working period set to "5"');
        console.log('SDS011 PARTICULATE SENSOR INITIALISED');
    } catch (error) {
        console.log('Error initialising SDS011 sensor', error);
    }
}

module.exports = sensor;