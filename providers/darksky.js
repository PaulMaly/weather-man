var axios = require('axios');
var CurrentResult = require('../results/currentResult');
var MalformedResponse = require('../utils/exceptions').MalformedResponse;
var constants = require('../utils/constants');

function condition(code) {
    var returnCode = constants.CLEAR;

    var map = {
        'clear-day': constants.CLEAR,
        'clear-night': constants.CLEAR,
        'rain': constants.RAIN,
        'snow': constants.SNOW,
        'sleet': constants.SNOW,
        'wind': constants.WIND,
        'fog': constants.FOG,
        'cloudy': constants.CLOUDY,
        'partly-cloudy-day': constants.CLOUDY,
        'partly-cloudy-night': constants.CLOUDY,
        'hail': constants.HAIL,
        'thunderstorm': constants.THUNDERSTORM,
        'tornado': constants.TORNADO,
    };

    if (map[code]) {
        returnCode = map[code];
    }

    return returnCode;
}

function convertTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.getHours() * 60 + date.getMinutes();
}

function getCurrent(lat, lng, apiKey) {
    var url = 'https://api.darksky.net/forecast/' + apiKey + '/' + lat + ',' + lng;
    return axios.get(url).then(function(res) {
        var result = new CurrentResult();

        if (res.data.currently && res.data.daily) {
            result.setTemperature(res.data.currently.temperature, constants.FAHRENHEIT);
            result.setCondition(condition(res.data.currently.icon));
            result.setHumidity(res.data.currently.humidity * 100);
            result.setWindSpeed(res.data.currently.windSpeed, constants.MILES);

            var current = null;
            for (var index in res.data.daily.data) {
                if (!current || res.data.daily.data[index].time < current.time) {
                    current = res.data.daily.data[index];
                }
            }

            if (current) {
                result.setSunrise(convertTime(current.sunriseTime));
                result.setSunset(convertTime(current.sunsetTime));
            }
        }
        else {
            throw new MalformedResponse(constants.OPENWEATHERMAP);
        }

        return result;
    });
}

module.exports = {
    getCurrent: getCurrent,
};
