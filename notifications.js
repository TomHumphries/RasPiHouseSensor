const https = require('https');
const keys = require('./keys');

const mhz19bSensor = require('./sensors/MHZ19B');
mhz19bSensor.on('data', mhz19bMeasureEvent);

var co2 = 0;
var lastCo2Alert = new Date(new Date().valueOf() - (1000*60*60*24)); // 24 hours ago

function mhz19bMeasureEvent(data) {
    let newCo2 = data['co2'];
    if (newCo2 >= 800 && co2 < 800) {
        const now = new Date();
        const msSinceLastAlert = (now.valueOf() - lastCo2Alert.valueOf());
        if (msSinceLastAlert > 1000 * 60 * 15) {
            // at least 15 mins
            lastCo2Alert = now;
            sendPhoneNotification('CO2', newCo2);
        }
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