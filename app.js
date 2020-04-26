const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
var bodyParser = require('body-parser');
const util = require('./util');

require('./data-logging');
require('./notifications');

app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/data', (req, res, next) => {res.set('Content-Type', 'text/plain'); next()}, express.static('data'));
app.use('/', express.static('public'));

app.get('/', (req, res, next) => {
    
    let dateStr = req.query.date;
    let date = new Date(dateStr);
    if (Number.isNaN(date.valueOf())) {
        date = new Date();
    }
    let dataSignals = [];

    // create a year of dates
    const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const dates = [];
    for (let i = 0; i < 365; i++) {
        dates.push(new Date(today));
        today.setUTCDate(today.getUTCDate() - 1);
    }

    const messages = [];

    const temperature = {};
    const temperatureCsv = loadCsvDate('temperature', date);
    temperature.data = csvToHighchartPoints(temperatureCsv);
    temperature.value = '';
    if (temperature.data[temperature.data.length - 1]) temperature.value = temperature.data[temperature.data.length - 1][1];
    addNullAtNextMidnightHighcharts(temperature.data, date);

    if (temperature.value < 15) {
        temperature.text = "Cold",
        temperature.class = "text-danger"
        messages.push(`It's cold. `);
    } else if (temperature.value < 18) {
        temperature.text = "Chilly",value =
        temperature.class = "text-warning"
        messages.push(`It's a little cold. `);
    } else if (temperature.value > 22) {
        temperature.text = "Warm",
        temperature.class = "text-warning"
        messages.push(`It's a little warm. `);
    } else if (temperature.value > 25) {
        temperature.text = "Hot",
        temperature.class = "text-danger"
        messages.push(`It's hot. `);
    } else {
        temperature.text = "Good",
        temperature.class = "text-success"
    }


    const humidity = {};
    const humidityCsv = loadCsvDate('humidity', date);
    humidity.data = csvToHighchartPoints(humidityCsv);
    humidity.value = Number.NaN;
    if (humidity.data[humidity.data.length - 1] != null) humidity.value = humidity.data[humidity.data.length - 1][1];
    addNullAtNextMidnightHighcharts(humidity.data, date);
    
    if (humidity.value < 30) {
        humidity.text = "Dry",
        humidity.class = "text-warning"
        messages.push(`It's a bit dry. `);
    } else if (humidity.value > 70) {
        humidity.text = "Humid",
        humidity.class = "text-danger"
        messages.push(`It's very humid. `);
    } else if (humidity.value > 55) {
        humidity.text = "Humid",
        humidity.class = "text-warning"
        messages.push(`It's a bit humid. `);
    } else {
        humidity.text = "Good",
        humidity.class = "text-success"
    }
    

    // https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info&pollutant=pm25#pollutant
    const pm2p5 = {};
    const pm2p5Csv = loadCsvDate('pm2.5', date);
    pm2p5.data = csvToHighchartPoints(pm2p5Csv);
    pm2p5.value = Number.NaN;
    if (pm2p5.data[pm2p5.data.length - 1] != null) pm2p5.value = pm2p5.data[pm2p5.data.length - 1][1];
    addNullAtNextMidnightHighcharts(pm2p5.data, date);
    
    // based on WHO guidelines
    if (pm2p5.value > 25) {
        pm2p5.text = "High",
        pm2p5.class = "text-danger"
        messages.push(`The 2.5 μm count is above 24 hour mean limits. `);
    } else if (pm2p5.value > 10) {
        pm2p5.text = "Moderate",
        pm2p5.class = "text-warning"
        messages.push(`The 2.5 μm count is above annual mean limits. `);
    } else {
        pm2p5.text = "OK",
        pm2p5.class = "text-success"
    }

    // based on UK guidelines
    // if (pm2p5.value >= 71) {
    //     pm2p5.text = "Very High",
    //     pm2p5.class = "text-danger"
    //     messages.push(`The 2.5 μm particle count is very high. `);
    // } else if (pm2p5.value >= 54) {
    //     pm2p5.text = "High",
    //     pm2p5.class = "text-danger"
    //     messages.push(`The 2.5 μm particle count is high. `);
    // } else if (pm2p5.value >= 36) {
    //     pm2p5.text = "Moderate",
    //     pm2p5.class = "text-warning"
    //     messages.push(`The 2.5 μm particle count is moderate. `);
    // } else {
    //     pm2p5.text = "Low",
    //     pm2p5.class = "text-success"
    // }

    const pm10 = {};
    const pm10Csv = loadCsvDate('pm10', date);
    pm10.data = csvToHighchartPoints(pm10Csv);
    pm10.value = Number.NaN;
    if (pm10.data[pm10.data.length - 1] != null) pm10.value = pm10.data[pm10.data.length - 1][1];
    addNullAtNextMidnightHighcharts(pm10.data, date);
    
    if (pm10.value > 50) {
        pm10.text = "High",
        pm10.class = "text-danger"
        messages.push(`The 10 μm count is above 24 hour mean limits. `);
    } else if (pm10.value > 20) {
        pm10.text = "Moderate",
        pm10.class = "text-warning"
        messages.push(`The 10 μm count is above annual mean limits. `);
    } else {
        pm10.text = "OK",
        pm10.class = "text-success"
    }
    // if (pm10.value >= 101) {
    //     pm10.text = "Very High",
    //     pm10.class = "text-danger"
    //     messages.push(`The 10 μm particle count is very high. `);
    // } else if (pm10.value >= 76) {
    //     pm10.text = "High",
    //     pm10.class = "text-danger"
    //     messages.push(`The 10 μm particle count is high. `);
    // } else if (pm10.value >= 51) {
    //     pm10.text = "Moderate",
    //     pm10.class = "text-warning"
    //     messages.push(`The 10 μm particle count is moderate. `);
    // } else {
    //     pm10.text = "Low",
    //     pm10.class = "text-success"
    // }

    
    // papers listed in article https://medium.com/@joeljean/im-living-in-a-carbon-bubble-literally-b7c391e8ab6
    // increase CO2 by 400 ppm => decrease cogntitive function by 20% 
    // using multiples of 400 ppm
    const co2 = {};
    const co2Csv = loadCsvDate('CO2', date);
    co2.data = csvToHighchartPoints(co2Csv);
    co2.value = Number.NaN;
    if (co2.data[co2.data.length - 1] != null) {
        co2.value = co2.data[co2.data.length - 1][1];
    }
    addNullAtNextMidnightHighcharts(co2.data, date);
    if (co2.value >= 1600) {
        co2.text = "Very High",
        co2.class = "text-danger"
        messages.push(`The CO2 concentration is very high. `);
    } else if (co2.value >= 1200) {
        co2.text = "High",
        co2.class = "text-danger"
        messages.push(`The CO2 concentration is high. `);
    } else if (co2.value >= 700) {
        co2.text = "Moderate",
        co2.class = "text-warning"
        messages.push(`The CO2 concentration is moderate. `);
    } else {
        co2.text = "OK",
        co2.class = "text-success"
    }
    
    if (messages.length == 0) messages.push('Everything looks OK.');


    let nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    // if (nextDate > new Date()) nextDate = null;
    const prevDate = new Date(date);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);

    res.render('home', {
        pagetitle: 'Charts',
        dataSignals,
        temperature,
        humidity,
        pm2p5,
        pm10,
        co2,
        messages,
        nextDate,
        prevDate,
        dates
    })
})

function loadCsvDate(name, date = new Date()) {
    // const date = new Date();
    const dataFilepath = util.BuildFilepath(name, 'raw.csv', date.getUTCFullYear(), (date.getUTCMonth() + 1), date.getUTCDate());
    let csv = '';
    try {
        csv = fs.readFileSync(dataFilepath).toString();
    } catch (error) {
        console.log('no file', dataFilepath);
    }
    return csv;
}
function csvToChartJsPoints(csv) {
    // console.log('csv', csv);
    if (!csv) return [];
    const lines = csv.split('\r\n');
    const points = [];
    lines.forEach(line => {
        const cells = line.split(',');
        const value = +cells[1]
        const timestamp = new Date(cells[0]).valueOf();
        if (Number.isNaN(value) || Number.isNaN(timestamp)) return;
        points.push({
            t: timestamp,
            y: value
        })
    });
    return points;
}
function csvToHighchartPoints(csv) {
    // console.log('csv', csv);
    if (!csv) return [];
    const lines = csv.split('\r\n');
    const points = [];
    lines.forEach(line => {
        const cells = line.split(',');
        const value = +cells[1]
        const timestamp = new Date(cells[0]).valueOf();
        if (Number.isNaN(value) || Number.isNaN(timestamp)) return;
        points.push([timestamp, value]);
    });
    return points;
}
function addNullAtNextMidnightHighcharts(points, date = new Date()) {
    const next = new Date(date);
    points.push([next.setUTCHours(24,0,0,0).valueOf(), 'null']);
}
function addNullAtNextMidnightChartJs(points) {
    points.push({
        t: new Date().setUTCHours(24,0,0,0).valueOf(),
        y: 'null'
    })
}

function getSignals() {
    const folders = getDirectories('./data');
    return folders;
}

const { readdirSync } = require('fs')
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


app.listen(3005, () => {
    console.log('Sensor server running');
})