define([ 'text!templates/search.html', 'config'], function(SearchTemplate, Config) {

	var SearchView = Backbone.View.extend({

		template : _.template(SearchTemplate),

		typeSearch : 'leads',

		events : {
			"submit #searchform"    : "launchSearch",
			"click .ui-icon-delete" : "clearSearch",
			"click #refreshButton"  : "refresh"
		},

		initialize: function() {
			_.bindAll(this, "render");
			document.addEventListener('online', this.render, false);
			document.addEventListener('offline', this.render, false);
		},

		setType : function (type) {
			this.typeSearch = type;
		},

		render : function() {
			console.log("render : SearchView");
			this.$el.html(this.template());

			if (currentView !== "leads") $("#refreshButton").addClass("hidden");
			else $("#refreshButton").removeClass("hidden");

			// Online/Offline management
			var online = App.isOnline();
			$("#refreshButton").fadeTo('fast', (online ? 1 : 0.5));
			if (!online) $("#refreshButton").addClass("ui-disabled");
			else $("#refreshButton").removeClass("ui-disabled");


			this.$el.trigger("create");
			return this;
		},

		refresh : function () {
			if (App.isOnline()) this.trigger("refreshList");
			return false;
		},

		clearSearch : function () {
			if ($(this.el).attr("id") == "customerSearch") {
				$(".project-dealers div.ui-grid-b").show();
			}
			else {
				$("#leads-list li").show();
			}
		},
		
		/*Customer EVENT - BEGIN */
		launchSearch : function (e) {
			e.preventDefault();
			
			if (!App.isOnline()) return;

			console.log ("Launch Search");

			var letters = this.$("#searchinput1").val();

            var me = this;
            var ws_qs_roleid = '&crmid='+globalUser.get('USER').crmid;
  			if (globalUser.get('ISSALESREP')==true) {
	  				ws_qs_roleid = '&salesRepId='+globalUser.get('USER').cn;
	  			}
  			if(letters!='') {
	             // Search

				if ($(this.el).attr("id") == "customerSearch") {
					var data = {
						method:"findDealers",
						countryCode:globalUser.get('USER').c,
						language:globalUser.get('LANGUAGE'),
						zip:letters,
						filter:letters
					};
					
					$.ajax({url:Config.baseURL, data:data,
		                 success : function (data) {
		                     var dataObj = jQuery.parseJSON(data);

		                     // hide all and display results
		                     $(".project-dealers div.ui-grid-b").hide();
		                     if (dataObj.length) {
		                        for(i=0 ; i< dataObj.length ; i++) {
		                            $('.project-dealers #'+dataObj[i].id).parent().show();
		                        }
		                     }
		                     return false;
		                 },
		                 error : function () {
		                     console.log("Error while searching customers");
		                     return false;
		                 }
					});
				}
				else {
		             $.ajax({
		                 url : Config.baseURL + '?method=SearchLeads'+ws_qs_roleid+'&siteid='+globalUser.get('SITEID')+'&language='+globalUser.get('LANGUAGE')+'&token='+globalUser.get('TOKEN')+'&filter='+letters,
		                 success : function (data) {
		                     var dataObj = jQuery.parseJSON(data);
		                     // hide all and display results
		                     $("#leads-list li").hide();
		                     if (dataObj.results) {
		                        sResult = dataObj.results;
		                        
		                        aResult=sResult.split(',');                       
		                        for(i=0 ; i< aResult.length ; i++) {
		                        	var sPid = "p"+aResult[i];
		                            $('#'+sPid).show();
		                        }
		                     }
		                     return false;
		                 },
		                 error : function () {
		                     console.log("Error while searching leads");
		                     return false;
		                 }
		             });
				}
  			}
  			return false;
		}
		
	});

	return SearchView;

});