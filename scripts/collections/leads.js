define(['models/lead', 'cache', 'config'], function(Lead, Cache, Config) {

    var LeadList = Backbone.Collection.extend({

        model: Lead,

        url: function(User){
            var ws_qs_roleid = '&crmid='+globalUser.get('USER').crmid;
            if (globalUser.get('ISSALESREP') === true) ws_qs_roleid = '&salesRepId='+globalUser.get('USER').cn;
            var url = Config.baseURL +"?method=GetLeads";
            url += '&' + ws_qs_roleid;
            url += '&siteid=' + globalUser.get('SITEID');
            url += '&language=' + globalUser.get('LANGUAGE');
            url += '&token=' + globalUser.get('TOKEN');
            return url;
		},

        parse: function(resp, options) {
            Cache.saveFile("leads.json", options.xhr.responseText);
            return resp;
        }

    });

    return LeadList;

});

/* http://service.ppr-somfy.msp.fr.clara.net/leadmanagement/MobileService.cfc?method=GetLeads&crmid=056106017&siteid=B78C92B0-0CF0-9A0D-7F26215B5BA3CF7C&language=fr-fr&token=Z/dXoFOL$cuZMuw==$NO$B78C92B0-0CF0-9A0D-7F26215B5BA3CF7C */