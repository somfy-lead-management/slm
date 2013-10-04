define([ 'text!templates/filters.html' ],

function(filterTemplate) {

	
	var FiltersView = Backbone.View.extend({
	

		template : _.template(filterTemplate),

		events : {
			"click .only-cust .filter.all" : "showAlloCust",
			"click .only-cust .filter.new" : "showNew",
			"click .only-cust .filter.accepted" : "showAccepted",
			"click .only-cust .filter.closed" : "showClosed",

			"click .only-srep .filter.all" : "showAll",
			"click .only-srep .filter.not" : "showToAssign",
			"click .only-srep .filter.assigned" : "showAssigned",
			"click .only-srep .filter.refused" : "showRefused"

		},

		initialize: function() {
			_.bindAll(this, "render");
			document.addEventListener('online', this.render, false);
			document.addEventListener('offline', this.render, false);
		},

		render : function() {
			console.log("render : HeaderFilter");
			this.$el.html(this.template());
			
			var online = App.isOnline();
			if (online) {
				$("li.closed", this.$el).removeClass('ui-disabled');
			}
			else {
				$("li.closed", this.$el).addClass('ui-disabled');
			}

			this.$el.trigger("create");
			initView();
			return this;
		},
		
		/*Customer EVENT - BEGIN */
		showAlloCust : function() {
			$('#searchinput1').val('');
			$("#leads-list li").show();
			$("#leads-list li.closed").hide();
		},

		showNew : function() {
			$('#searchinput1').val('');
			$("#leads-list li").hide();
			$("#leads-list li.new").show();
		},

		showAccepted : function() {
			$('#searchinput1').val('');
			$("#leads-list li").hide();
			$("#leads-list li.accepted").show();
		},

		showClosed : function() {
			if (App.isOnline()) this.trigger("completeCollectionClosed");
		},

		filterClosed : function () {
			$('#searchinput1').val('');
			$("#leads-list li").hide();
			$("#leads-list li.closed").show();
		},
		/*Customer EVENT - END */
		
		
		/*SREP EVENT - BEGIN */
		showAll : function() {
			$('#searchinput1').val('');
			$("#leads-list li").show();
			//$("#leads-list li.closed").hide();
		},

		showToAssign : function() {
			$('#searchinput1').val('');
			$("#leads-list li").hide();

			
			_.each($("#leads-list li"), function(item) {
				if ($(item).find(".dealerstatus").length) {
					_.each($(item).find(".dealerstatus"), function(child) {
						if($(child).hasClass("toassign")) {
							$(child).closest("li").show();
						}
					});
				}
				else {
					$("#leads-list li.toassign").show();
				}
			});
		},

		showAssigned : function() {
			$('#searchinput1').val('');
			$("#leads-list li").hide();

			_.each($("#leads-list li"), function(item) {
				if ($(item).find(".dealerstatus").length) {
					_.each($(item).find(".dealerstatus"), function(child) {
						if($(child).hasClass("assigned")) {
							$(child).closest("li").show();
						}
					});
				}
				else {
					$("#leads-list li.assigned").show();
				}
			});
		},

		showRefused : function() {
			$('#searchinput1').val('');
			$("#leads-list li").hide();

			_.each($("#leads-list li"), function(item) {
				if ($(item).find(".dealerstatus").length) {
					_.each($(item).find(".dealerstatus"), function(child) {
						if($(child).hasClass("refused")) {
							$(child).closest("li").show();
						}
					});
				}
				else {
					$("#leads-list li.closed").show();
				}
			});
		}
		/*SREP EVENT - END */
	});

	return FiltersView;
});