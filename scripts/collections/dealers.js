define(['models/dealer', 'config'], function(Dealer, Config){

    var DealerList = Backbone.Collection.extend({

        model: Dealer,

        initialize: function () { this._meta = {}; },

        meta: function(prop, value) {
            if (value === undefined) return this._meta[prop];
            else this._meta[prop] = value;
        },

        url: function(){
            var url = Config.baseURL + "?method=findDealers";
            url += '&countryCode=' + globalUser.get('USER').c;
            url += '&language=' + globalUser.get('LANGUAGE');
            url += '&zip=' + this.meta('ws_qs_zip');
            url += '&filter=' + this.meta('ws_qs_filter');
            url += '&applications=' + this.meta('ws_qs_applications');
            return url;
        }
    });

    return DealerList;
});

/*http://service.ppr-somfy.msp.fr.clara.net/leadmanagement/MobileService.cfc?method=findDealers&countryCode=lb&language=en-lb&zip=&filter=&applications=1,2,3*/