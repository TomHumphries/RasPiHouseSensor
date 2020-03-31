var sensorLib = require('node-dht-sensor');
var CronJob = require('cron').CronJob;
const Events = require('events');
var eventEmitter = new Events.EventEmitter();

console.log('INITIALISING DHT22 AIR SENSOR');

var job = new CronJob('* * * * *', function () {
    takeReading();
}, null, true, null);
job.start();

function takeReading() {
    try {
        sensorLib.read(22, 4, function (err, temperature, humidity) {
            if (err) {
                console.log("Error taking DHT22 reading", err);
            } else {
                // console.log(`temperature=${temperature.toFixed(1)}\r\nhumidity=${humidity.toFixed(1)}`);
                eventEmitter.emit('measure', {
                    "temperature": temperature.toFixed(1),
                    "humidity": humidity.toFixed(1)
                })
            }
        });
    } catch (error) {
        console.log('DHT22 takeReading error', error);
    }
}


module.exports = eventEmitter;