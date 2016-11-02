var axios = require('axios');
var moment = require('moment');
var CurrentResult = require('../results/currentResult');
var constants = require('../utils/constants');
var results = require('../utils/results');

//https://developer.weatherunlocked.com/documentation/localweather/resources
function condition(code) {
    var returnCode = constants.CLEAR;

    if (code == 0) {
        returnCode = constants.CLEAR;
    }
    else if (code >= 1 && code <= 3) {
        returnCode = constants.CLOUDY;
    }
    else if (code == 10 || code == 45 || code == 49) {
        returnCode = constants.FOG;
    }
    else if (
        code == 21 ||
        code == 56 ||
        code == 57 ||
        (code >= 62 && code <= 65) ||
        code == 67 ||
        code == 81 ||
        code == 82
    ) {
        returnCode = constants.RAIN;
    }
    else if (
        (code >= 22 && code <= 24) ||
        code == 38 ||
        code == 39 ||
        (code >= 68 && code <= 79) ||
        (code >= 83 && code <= 88)
    ) {
        returnCode = constants.SNOW;
    }
    else if (code == 29 || code >= 91 || code == 92) {
        returnCode = constants.THUNDERSTORM;
    }
    else if (
        code == 50 ||
        code == 51 ||
        code == 80 ||
        code == 60 ||
        code == 61 ||
        code == 66
    ) {
        returnCode = constants.LIGHT_RAIN;
    }
    else if (code == 93 || code == 94) {
        returnCode = constants.SNOW_THUNDERSTORM;
    }


    return returnCode;
}

function flatResults(res) {

    var map = {};

    map[constants.LAT] = 'lat';
    map[constants.LON] = 'lng';
    map[constants.TEMP] = 'temp_f';
    map[constants.CODE] = 'wx_code';
    map[constants.SUMMARY] = 'wx_desc';
    map[constants.HUMIDITY] = 'humid_pct';
    map[constants.PRESSURE] = 'slp_in';
    map[constants.VISIBILITY] = 'vis_mi';
    map[constants.SUNRISE] = '_sunrise';
    map[constants.SUNSET] = '_sunset';
    map[constants.WIND_SPEED] = 'windspd_mph';
    map[constants.WIND_DIR] = 'winddir_compass';
    map[constants.FEELS_LIKE] = 'feelslike_f';

    return results.mapResults(res, map);
}

function convertTime(string) {
    var split = string.split(':');
    var hours = parseInt(split[0]);
    var minutes = parseInt(split[1]);

    return (hours * 60) + minutes;
}

function getCurrent(lat, lng, apiKey, appId, getSunrise) {
    var url = 'https://api.weatherunlocked.com/api/current/' + lat.toFixed(2) + ',' + lng.toFixed(2) + '?app_id=' + appId + '&app_key=' + apiKey;
    return axios.get(url).then(function(res) {
        var result = new CurrentResult();

        var data = res.data;

        result.setTemperature(data.temp_f, constants.FAHRENHEIT);
        result.setCondition(condition(data.wx_code));
        result.setHumidity(data.humid_pct);
        result.setWindSpeed(data.windspd_mph, constants.MILES);

        if (getSunrise) {
            var url = 'https://api.weatherunlocked.com/api/forecast/' + lat.toFixed(2) + ',' + lng.toFixed(2) + '?app_id=' + appId + '&app_key=' + apiKey;
            return axios.get(url).then(function(res) {
                var today = moment().format('DD/MM/YYYY');

                for (var i in res.data.Days) {
                    var day = res.data.Days[i];
                    if (day.date == today) {
                        result.setSunrise(convertTime(day.sunrise_time));
                        result.setSunset(convertTime(day.sunset_time));

                        data._sunrise = day.sunrise_time;
                        data._sunset = day.sunset_time;
                    }
                }

                result.setRawResults(flatResults(data));

                return result;
            });
        }
        else {
            result.setRawResults(flatResults(data));
        }

        return result;
    });
}

module.exports = {
    getCurrent: getCurrent,
};
