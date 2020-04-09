const https = require('https');
const keys = require('./keys');

const mhz19bSensor = require('./sensors/MHZ19B');
mhz19bSensor.on('data', mhz19bMeasureEvent);

var co2 = 0;
var limit = 800;

function mhz19bMeasureEvent(data) {
    let newCo2 = data['co2'];
    if (newCo2 >= limit && co2 < limit) {
      sendPhoneNotification('CO2', newCo2);
    }
    if (newCo2 < limit && co2 >= limit) {
      sendPhoneNotification('CO2', newCo2);
    }
    co2 = newCo2;
}

function sendPhoneNotification(type, value) {
    const options = {
        hostname: 'maker.ifttt.com',
        port: 443,
        path: `/trigger/sensor/with/key/${keys.MakerKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
      
      const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
      
        res.on('data', (d) => {
            
        })
      })
      
      req.on('error', (error) => {
        console.log('sendPhoneNotification error', error);
      })

      // Example notification: "The CO2 reading is 801 ppm"
      const data = JSON.stringify({
        value1: type, // CO2
        value2: `${value} ppm` // 801 ppm
      })

      req.write(data);
      req.end();
}