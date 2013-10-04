define(['cache', 'config'], function(Cache, Config) {

    var Dictionnary = Backbone.Model.extend({

		defaults : {currentLanguage : 'fr-fr'},

		urlRoot : function(){
			return Config.baseURL + "?method=loadTranslations&language=" + this.get("currentLanguage");
		},

		parse: function(data, options) {
			Cache.saveFile('dictionary.' + this.get("currentLanguage") + '.json', options.xhr.responseText);
			return data;
		}

    });

    return new Dictionnary();

});