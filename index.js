var yahoo = require('./providers/yahoo');
var openweathermap = require('./providers/openweathermap');
var yrno = require('./providers/yrno');
var forecastio = require('./providers/forecastio');
var constants = require('./utils/constants');
var InvalidProvider = require('./utils/exceptions').InvalidProvider;

var providers = {};
providers[constants.YAHOO] = yahoo;
providers[constants.OPENWEATHERMAP] = openweathermap;
providers[constants.YRNO] = yrno;
providers[constants.FORECASTIO] = forecastio;

var WeatherMan = function(provider, apiKey) {
    if (!providers[provider]) {
        throw new InvalidProvider(provider);
    }

    this.provider = provider;
    this.apiKey = apiKey;
};

WeatherMan.FAHRENHEIT = constants.FAHRENHEIT;
WeatherMan.CELCIUS = constants.CELCIUS;
WeatherMan.KELVIN = constants.KELVIN;

WeatherMan.KILOMETERS = constants.KILOMETERS;
WeatherMan.MILES = constants.MILES;
WeatherMan.METERS = constants.METERS;

WeatherMan.YAHOO = constants.YAHOO;
WeatherMan.OPENWEATHERMAP = constants.OPENWEATHERMAP;
WeatherMan.YRNO = constants.YRNO;
WeatherMan.FORECASTIO = constants.FORECASTIO;

WeatherMan.CLEAR = constants.CLEAR;
WeatherMan.CLOUDY = constants.CLOUDY;
WeatherMan.FOG = constants.FOG;
WeatherMan.LIGHT_RAIN = constants.LIGHT_RAIN;
WeatherMan.RAIN = constants.RAIN;
WeatherMan.THUNDERSTORM = constants.THUNDERSTORM;
WeatherMan.SNOW = constants.SNOW;
WeatherMan.HAIL = constants.HAIL;
WeatherMan.WIND = constants.WIND;
WeatherMan.EXTREME_WIND = constants.EXTREME_WIND;
WeatherMan.TORNADO = constants.TORNADO;
WeatherMan.HURRICANE = constants.HURRICANE;
WeatherMan.EXTREME_COLD = constants.EXTREME_COLD;
WeatherMan.EXTREME_HEAT = constants.EXTREME_HEAT;
WeatherMan.SNOW_THUNDERSTORM = constants.SNOW_THUNDERSTORM;

WeatherMan.prototype.getCurrent = function(lat, lng, getSunrise) {
    return providers[this.provider].getCurrent(lat, lng, this.apiKey, getSunrise);
};

module.exports = WeatherMan;
