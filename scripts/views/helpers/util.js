define(['config'], function(Config){

    var helpers = {

        displayPanelData : function (mode) {
            if (!App.isOnline()) return;

            $.mobile.showPageLoadingMsg(null, _.label("mobile.loading.panel"));
            var prefix = "";
            var modeWS = "";
            switch (mode) {
                case 'refuse':
                    modeWS = "leadmanagement.refusereason";
                    prefix = _.label("actions.refuselead")+" : ";
                    break;
                case 'close':
                    modeWS = "leadmanagement.noSalesReason";
                    prefix = _.label("nosale")+" : ";
                    break;
            }

            var data = {method:"LoadList", language:globalUser.get('LANGUAGE'), listcode:modeWS};
            var list = $.ajax({url:Config.baseURL, data:data, async: false,
                done: function(data){},
                fail: function () { console.log("Error while updating lead status. Please contact an administrator."); }
            }).responseText;
            var dataObj = jQuery.parseJSON(list);
            var panel = "";
            if (typeof(dataObj) == 'object' && dataObj.elements.length) {
                _.each(dataObj.elements, function(el) {
                    panel = panel + '<li><a class="action" href="#" data-id= "'+el.code+'" data-role="button" data-inline="true" data-rel="dialog">'+prefix+''+el.text+'</a></li>';
                });
                $.mobile.hidePageLoadingMsg();
                return panel;
            }
            else {
                console.log("Panel not loaded due to webservice error");
            }
            return panel;
        }
    };

    return helpers;

});