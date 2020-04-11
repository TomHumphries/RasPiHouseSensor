const fs = require('fs');
const path = require('path');

const sds011Sensor = require('./sensors/SDS011');
sds011Sensor.on('measure', sds011MeasureEvent);

const dht22Sensor = require('./sensors/DHT22');
dht22Sensor.on('measure', dht22MeasureEvent);

const mhz19bSensor = require('./sensors/MHZ19B');
mhz19bSensor.on('data', mhz19bMeasureEvent);

const latestReadings = {};

module.exports.latestReadings = latestReadings;

async function dht22MeasureEvent(data) {
    try {
        const timestamp = new Date();
        timestamp.setUTCMilliseconds(0);

        const temperature = data['temperature'];
        const humidity = data['humidity'];

        latestReadings.temperature = temperature;
        latestReadings.humidity = humidity;

        await LogReadingDaily('temperature', timestamp, temperature);
        await LogReadingMonthly('temperature', timestamp, temperature);

        await LogReadingDaily('humidity', timestamp, humidity);
        await LogReadingMonthly('humidity', timestamp, humidity);
    } catch (error) {
        console.log('Error taking DHT22 reading', error);
    }
}

async function sds011MeasureEvent(data) {
    try {
        const timestamp = new Date();
        timestamp.setUTCMilliseconds(0);

        const pm2p5 = data['PM2.5'];
        const pm10 = data['PM10'];

        latestReadings.pm2p5 = pm2p5;
        latestReadings.pm10 = pm10;

        await LogReadingDaily('pm2.5', timestamp, pm2p5);
        await LogReadingMonthly('pm2.5', timestamp, pm2p5);

        await LogReadingDaily('pm10', timestamp, pm10);
        await LogReadingMonthly('pm10', timestamp, pm10);
    } catch (error) {
        console.log('Error taking SDS011 reading', error);
    }
}

async function mhz19bMeasureEvent(data) {
    try {
        const timestamp = new Date();
        timestamp.setUTCMilliseconds(0);

        const co2 = data['co2'];

        latestReadings.co2 = co2;

        await LogReadingDaily('CO2', timestamp, co2);
        await LogReadingMonthly('CO2', timestamp, co2);
    } catch (error) {
        console.log('Error taking MH-Z19B reading', error);
    }
}


async function LogReadingDaily(name, timestamp, value) {
    const readingDirectory = path.join(
        __dirname,
        'data',
        name,
        timestamp.getUTCFullYear().toString(),
        zeroPad((timestamp.getUTCMonth() + 1), 2),
        zeroPad((timestamp.getUTCDate()), 2)
    );
    await CreateDirectoryAsync(readingDirectory);
    const filename = 'raw.csv';
    const filepath = path.join(readingDirectory, filename);
    const line = `${timestamp.toISOString()},${value}\r\n`;
    await AppendFileAsync(filepath, line);
}

async function LogReadingMonthly(name, timestamp, value) {
    const readingDirectory = path.join(
        __dirname,
        'data',
        name,
        timestamp.getUTCFullYear().toString(),
        zeroPad((timestamp.getUTCMonth() + 1), 2)
    );
    await CreateDirectoryAsync(readingDirectory);
    const filename = 'raw.csv';
    const filepath = path.join(readingDirectory, filename);
    const date = new Date()
    const line = `${timestamp.toISOString()},${value}\r\n`;
    await AppendFileAsync(filepath, line);
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

async function AppendFileAsync(filepath, text) {
    return new Promise((resolve, reject) => {
        fs.appendFile(filepath, text, (err) => {
            if (err) return reject(err);
            return resolve();
        })
    })
}

async function CreateDirectoryAsync(directory) {
    return new Promise((resolve, reject) => {
        fs.mkdir(directory, { recursive: true }, (err) => {
            if (err) return reject(err);
            return resolve();
        })
    })
}

async function CreateAverages() {
    const signalFolders = await GetFolders('./data');
    // load averages files
    // look for missing values
    // try to load files with missing values
    // calculate missing values
    // save averages files
}

async function GetFolders(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, { withFileTypes: true }, (err, files) => {
            resolve(files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name));
        })
    }) 
}