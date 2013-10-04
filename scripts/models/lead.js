define(['config'], function(Config) {

    var Lead = Backbone.Model.extend({

        idAttribute: "project_id",

        defaults: {
			ws_qs: '&crmid=&siteid=&language=&token=&projectid='
		},

		url: function(){
            return Config.baseURL + "?method=GetLeads" + this.get("ws_qs");
		}

    });

    return Lead;

});