define(
[
    'views/lists/leaditem',
    'views/detailedItem',
    'collections/leads',
    'views/filters',
    'views/search',
    'cache',
    'config'
],

function(LeadItemView, DetailedItemView, LeadList, FiltersView, SearchView, Cache, Config) {

    // that view handle a list view and create a detail view
    var LeadListView = Backbone.View.extend({

        el:'#wrap-content',

        template : _.template($("script.leadlist").html()),

        events: {
            'click .lead-details':'open',
            'click #refreshButton' : 'showList'
        },

        initialize: function(options) {
            var me = this;

            this.collection  = new LeadList();
            this.filtersView = new FiltersView();
            this.searchView  = new SearchView();
            this.searchView.setType("leads");
            this.itemView    = new LeadItemView();

            // bind some events
            this.filtersView.bind("completeCollectionClosed", this.completeCollectionClosed, this);
            this.searchView.bind("refreshList", this.showList, this);
            // fetch collection
            this.load();
        },

        load: function () {
            var self = this;
            var push = window.plugins.pushNotification;
            // Check if we're coming from a push notification
            if (push) {
                console.log("LeadListView.load()", "Checking for pending remote notifications");
                push.getPendingNotifications(function(pending){
                    var hasPending = pending.notifications.length > 0;
                    console.log("LeadListView.load()", "has pending notifications ?", hasPending ? "YES" : "NO");
                    self.loadData(hasPending);
                    //if (hasPending) push.cancelAllLocalNotifications(function(){ console.log("LeadListView.load()", "CANCELLED ALL LOCAL NOTIFICATIONS");});
                });
            }
            else self.loadData(false);
        },

        loadData: function(skipCache) {
            var self = this;
            $.mobile.showPageLoadingMsg(null, _.label("mobile.loading.data"));
            console.log("LeadListView.loadData()", "skipCache:", (skipCache ? "YES" : "NO"));
            var online = App.isOnline();
            if (online && skipCache) {
                self.collection.fetch({reset:true,
                    success: function() {
                        $.mobile.hidePageLoadingMsg();
                        self.itemView.setCollection(self.collection);
                        self.render();
                        if (self.collection.length === 0) self.emptyMessage();
                    }
                });
            }
            else {
                Cache.getFile('leads.json',
                    function(data){
                        console.log("got offline leads");
                        self.collection.reset(JSON.parse(data));
                        if (online) self.collection.fetch({
                            reset: true,
                            success: function(){
                                $.mobile.hidePageLoadingMsg();
                                if (self.collection.length === 0) self.emptyMessage();
                                else {
                                    self.itemView.setCollection(self.collection);
                                    self.render();
                                }
                            }
                        });
                        else {
                            $.mobile.hidePageLoadingMsg();
                            self.itemView.setCollection(self.collection);
                            self.render();
                            if (self.collection.length === 0) self.emptyMessage();
                        }
                    },
                    function(err){
                        console.log("No offline leads");
                        if (online)
                            self.collection.fetch({
                                reset: true,
                                success: function() {
                                    $.mobile.hidePageLoadingMsg();
                                    self.itemView.setCollection(self.collection);
                                    self.render();
                                    if (self.collection.length === 0) self.emptyMessage();
                                }
                            });
                        else {
                            $.mobile.hidePageLoadingMsg();
                            alert("Error: no internet connection!");
                        }
                    }
                );
            }
        },

        render: function() {

            if (currentView !== "leads") return;

            this.$el.html(this.template());
            this.filtersView.setElement($("#wrap-filters")).render();
            this.searchView.setElement($("#search-box")).render();
            this.itemView.setElement(this.$("#leads-list")).render();

            $("#page").trigger('create');
            initView();
            return this;
        },

        reloadList: function () {
            this.itemView.setElement(this.$("#leads-list")).render();
            $("#leads-list").listview("refresh");
            initView();
            return this;
        },

        open: function (ev) {
            ev.preventDefault();

            $("#refreshButton").addClass("hidden");

            // get usefull data
            var id = $(ev.currentTarget).data("id");
            var item = this.collection.get(id);

            // hide list view and show detail view
            var detailedView = new DetailedItemView({model:item});
            currentView = "details";

            detailedView.on("closeMe", this.showList, this);
            $("#leads-list").hide();
            $(".search").hide();

            $("#page").removeClass("login");
            $("#page").addClass("details");
            detailedView.render();

            $("#item-detail").trigger('create');
            initView();
            $(".filter-bar").hide();
        },

        showList: function (e) {
            if (typeof(e) === undefined) $("#refreshButton").removeClass("hidden");
            $(this.$el).empty();
            this.load();
        },

        emptyMessage: function () {
            alert("No leads available");
        },

        completeCollectionClosed: function () {

            if (!App.isOnline()) return;
            $.mobile.showPageLoadingMsg(null, _.label("mobile.loading.data"));
            var me = this;

            var data = {
                method:       "GetLeads",
                statusFilter: "closed",
                siteId:       globalUser.get("SITEID"),
                token:        globalUser.get('TOKEN'),
                language:     globalUser.get('LANGUAGE')
            };
            if (globalUser.get('ISSALESREP') === true) data.salesRepId = globalUser.get('USER').cn;
            else data.crmId = globalUser.get('USER').crmid;

            $.ajax({url: Config.baseURL, data: data,
                success: function (data) {
                    var dataObj = jQuery.parseJSON(data);
                    me.collection.add(dataObj);
                    me.reloadList();
                    me.filtersView.filterClosed();
                   $.mobile.hidePageLoadingMsg();
                },
                error: function () {
                    alert("Unable to load leads due to unknown error.");
                    $.mobile.hidePageLoadingMsg();
                }
            });
        }
    });

    return LeadListView;

});