define(['models/country', 'config', 'cache'], function(Country, Config, Cache) {

    var CountryList = Backbone.Collection.extend({

        model:  Country,

        comparator: function(country) { return country.get('name'); },

        url: function() { return Config.baseURL + "?method=GetCountries"; },

        parse: function(resp, options) {
            Cache.saveFile("countries.json", options.xhr.responseText);
            return resp;
        }
    });

    return CountryList;
});