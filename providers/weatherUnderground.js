var axios = require('axios');
var CurrentResult = require('../results/currentResult');
var constants = require('../utils/constants');
var results = require('../utils/results');

function condition(code) {
    var returnCode = constants.CLEAR;

    var map = {
        'chanceflurries': constants.SNOW,
        'chancerain': constants.LIGHT_RAIN,
        'chancesleet': constants.SNOW,
        'chancesnow': constants.SNOW,
        'chancetstorms': constants.THUNDERSTORM,
        'clear': constants.CLEAR,
        'cloudy': constants.CLOUDY,
        'flurries': constants.SNOW,
        'fog': constants.FOG,
        'hazy': constants.FOG,
        'mostlycloudy': constants.CLOUDY,
        'mostlysunny': constants.CLEAR,
        'partlycloudy': constants.CLEAR,
        'partlysunny': constants.CLOUDY,
        'sleet': constants.SNOW,
        'rain': constants.RAIN,
        'sleet': constants.SNOW,
        'snow': constants.SNOW,
        'sunny': constants.CLEAR,
        'tstorms': constants.THUNDERSTORM,
    };

    if (map[code]) {
        returnCode = map[code];
    }

    return returnCode;
}

function flatResults(res) {

    var map = {};

    map[constants.LAT] = 'current_observation.observation_location.latitude';
    map[constants.LON] = 'current_observation.observation_location.longitude';
    map[constants.TEMP] = 'current_observation.temp_f';
    map[constants.CODE] = 'current_observation.icon';
    map[constants.SUMMARY] = 'current_observation.weather';
    map[constants.HUMIDITY] = 'current_observation.relative_humidity';
    map[constants.PRESSURE] = 'current_observation.pressure_in';
    map[constants.VISIBILITY] = 'current_observation.visibility_mi';
    map[constants.SUNRISE] = 'sun_phase.sunrise.hour';
    map[constants.SUNSET] = 'sun_phase.sunset.hour';
    map[constants.WIND_SPEED] = 'current_observation.wind_mph';
    map[constants.WIND_DIR] = 'current_observation.wind_dir';
    map[constants.FEELS_LIKE] = 'current_observation.feelslike_f';

    return results.mapResults(res, map);
}

function getCurrent(lat, lng, apiKey) {
    var url = 'http://api.wunderground.com/api/' + apiKey + '/conditions/astronomy/q/' + lat + ',' + lng + '.json';
    return axios.get(url).then(function(res) {
        var result = new CurrentResult();

        if (res.data.sun_phase) {
            var sun = res.data.sun_phase;

            result.setSunrise(parseInt(sun.sunrise.hour) * 60 + parseInt(sun.sunrise.minute));
            result.setSunset(parseInt(sun.sunset.hour) * 60 + parseInt(sun.sunset.minute));
        }

        if (res.data.current_observation) {
            var current = res.data.current_observation;

            result.setTemperature(current.temp_f, constants.FAHRENHEIT);
            result.setCondition(condition(current.icon));
            result.setHumidity(parseInt(current.relative_humidity));
            result.setWindSpeed(current.wind_mph, constants.MILES);

            result.setRawResults(flatResults(res.data));
        }
        else {
            throw new MalformedResponse(constants.WEATHER_UNDERGROUND);
        }

        return result;
    });
}

module.exports = {
    getCurrent: getCurrent,
};
