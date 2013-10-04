define(['cache', 'config'], function(Cache, Config) {

    var User = Backbone.Model.extend({

		idAttribute: 'crmid',

        defaults: {
			ws_qs: '&username=***athome***&password=***test***&countrycode=***fr***'
		},

		urlRoot: function() { return Config.baseURL + "?method=login" + this.get("ws_qs"); },

		initialize: function(){
            this.on("change:AUTHENTIFIED", function(model){
                var AUTHENTIFIED = model.get("AUTHENTIFIED");
                if(AUTHENTIFIED === true) this.trigger("login-success");
                else {
                    // reset status so that change event is called on each login try
                    model.set({AUTHENTIFIED:''}, {silent: true});
                    this.trigger("login-failed");
                }
            });
        },

        parse: function(data, options) {
            var clone = _.clone(data);
            if (Config.rememberMe !== true) clone.AUTHENTIFIED = false;
            Cache.saveFile('user.json', JSON.stringify(clone));
            return data;
        },

        isSalesRep: function() { return this.get("ISSALESREP") === true; },

        isAuthentified: function() { return this.get("AUTHENTIFIED") === true; }

    });

    return User;

});

/* 'ISSALESREP', 'LANGUAGE', 'SITEID', 'AUTHENTIFIED', 'c', 'crmid', 'sn', 'preferredlanguage', 'mail', 'cn', 'user', 'TOKEN' */