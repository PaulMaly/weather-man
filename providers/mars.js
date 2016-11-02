var axios = require('axios');
var CurrentResult = require('../results/currentResult');
var constants = require('../utils/constants');
var results = require('../utils/results');

function condition(code) {
    code = code.toLowerCase()
    var returnCode = constants.CLEAR;

    if (code != 'sunny') { //It seems to be all ways clear, so this is just an assumption
        returnCode = constants.CLOUDY;
    }

    return returnCode;
}

function flatResults(res) {

    var map = {};

    map[constants.TEMP] = '_temp';
    map[constants.CODE] = 'atmo_opacity';
    map[constants.SUMMARY] = 'atmo_opacity';
    map[constants.HUMIDITY] = 'abs_humidity';
    map[constants.PRESSURE] = 'pressure';
    map[constants.SUNRISE] = 'sunrise';
    map[constants.SUNSET] = 'sunset';
    map[constants.WIND_SPEED] = 'wind_speed';
    map[constants.WIND_DIR] = 'wind_direction';

    return results.mapResults(res, map);
}

function convertTime(string) {
    var date = new Date(string);
    return date.getHours() * 60 + date.getMinutes();
}

function getCurrent() {
    var url = 'http://marsweather.ingenology.com/v1/latest/';
    return axios.get(url).then(function(res) {
        var result = new CurrentResult();

        var report = res.data.report;

        report._temp = (report.min_temp + report.max_temp) / 2
        result.setTemperature(report._temp, constants.CELCIUS);
        result.setCondition(condition(report.atmo_opacity));

        if (report.abs_humidity) {
            result.setHumidity(report.abs_humidity);
        }

        if (report.wind_speed) {
            result.setWindSpeed(report.wind_mph, constants.KILOMETERS);
        }

        result.setSunrise(convertTime(report.sunrise));
        result.setSunset(convertTime(report.sunset));

        result.setRawResults(flatResults(report));

        return result;
    });
}

module.exports = {
    getCurrent: getCurrent,
};
