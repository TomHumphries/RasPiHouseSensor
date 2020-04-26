const https = require('https');
const keys = require('./keys');

const mhz19bSensor = require('./sensors/MHZ19B');
mhz19bSensor.on('data', mhz19bMeasureEvent);

var co2 = 0;
var limit = 700;

function mhz19bMeasureEvent(data) {
  try {
    let newCo2 = data['co2'];
    if (newCo2 >= limit && co2 < limit) {
      sendPhoneNotification(`CO2 High: ${newCo2} ppm`);
    }
    if (newCo2 < limit && co2 >= limit) {
      sendPhoneNotification(`CO2 OK: ${newCo2} ppm`);
    }
    co2 = newCo2;
  } catch (error) {
    console.log('Error with notification MH-Z19b measure event', error);
  }
}

function sendPhoneNotification(message) {
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

      const data = JSON.stringify({
        value1: message
      })

      req.write(data);
      req.end();
}