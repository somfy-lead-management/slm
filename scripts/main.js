define(
[
    'views/login',
    'models/dictionnary',
    'models/user',
    'views/lists/leads',
    'collections/leads',
    'collections/dealers',
    'lib',
    'cache',
    'config'
],

    function(LoginView, dico, User, LeadListView, LeadList, dealerList, lib, Cache, Config) {
        var App = function(deviceToken) {
            $.mobile.showPageLoadingMsg();
            console.log("creating App", deviceToken);
            var me = this;
            this.dictionary = dico;
            this.config = Config;

            this.reloadAfter = function(delay) {
                console.log("App.reloadAfter()", delay + "ms");
                setTimeout(function(){ location.reload(); }, delay);
            };

            this.logout = function(){
                $.mobile.showPageLoadingMsg();
                console.log("App.logout()", "Logging out...");
                me.user.set({AUTHENTIFIED:false}, {silent:true});
                Cache.saveFile("user.json", JSON.stringify(me.user.toJSON()),
                    function(){ console.log("App.logout()", "offline user saved"); me.reloadAfter(300); },
                    function(){ console.error("App.logout()", "Couldn't cache user data"); me.reloadAfter(100); }
                );
            };

            this.onPause = function() {
                console.log("PAUSE");
                if (Config.rememberMe && me.user.isAuthentified()) {
                    // Nothing to do...
                }
                else me.logout();
            };

            $('#logout a').click(function() {
                me.logout();
                return false;
            });

            document.addEventListener("pause", this.onPause, false);

            currentView = "";
            globalUser = new User();
            this.user = globalUser;

            this.isOnline = function() {
                if (!window.navigator.connection) return true;
                var type = window.navigator.connection.type;
                return (type !== Connection.UNKNOWN && type !== Connection.NONE);
            };
            /*
            this.resetBadge = function() {
                var pn = window.plugins.pushNotification;
                if (pn) {
                    pn.cancelAllLocalNotifications();
                    pn.setApplicationIconBadgeNumber(0);
                }
                console.log("Resetting badge count");
                if (!me.isOnline()) { console.log("Oops not online"); return;}
                if (!deviceToken) { console.log("Oops no device token"); return;}
                var data = {method:"resetBadge"};
                data.userToken = me.user.get("TOKEN");
                data.deviceToken = deviceToken;
                $.ajax({url:Config.baseURL, data:data,
                    success: function(data){ console.log("Badge count reset was successful"); },
                    error: function(xhr, status, err){ console.log("Could not reset badge count", status, err); }
                });
            };
            */
            this.registerForPushNotifications = function() {
                console.log("Registering for push notifications", deviceToken);
                if (!me.isOnline()) { console.log("Oops not online"); return;}
                if (!deviceToken) { console.log("Oops no device token"); return;}
                var data = {method:"SetDeviceToken"};
                data.userToken = me.user.get("TOKEN");
                data.userid = me.user.get("USER").crmid;
                data.deviceToken = deviceToken;
                $.ajax({url:Config.baseURL, data:data,
                    success: function(data){
                        console.log("Device successfuly registered!", JSON.parse(data).SUCCESS);
                    },
                    error: function(xhr, status, err){ console.log("Error while registering device", status, err); }
                });
            };

            /*Login view*/
            this.loginMode = function() {
                $.mobile.hidePageLoadingMsg();
                console.log("App.loginMode()");
                currentView = "login";
                me.views.login = new LoginView();
                $("#infoLogin").hide();
                $('#wrap-content').html(this.views.login.render().el);
                $("#wrap-content").trigger('create');
            };

            this.loginFailedMode = function() {
                $.mobile.hidePageLoadingMsg();
                $("#popupLoginError").popup("open");
            };

            this.listMode =  function() {
                $.mobile.hidePageLoadingMsg();
                me.registerForPushNotifications();
                //me.resetBadge();
                console.log("App.listMode()");
                currentView = "leads";
                /*Init List mode view*/
                $("#logout").removeClass("hidden");
                $('#wrap-content').empty();
                $("#page").removeClass("login");
                $("#page").addClass("details");

                $.mobile.showPageLoadingMsg(null, dico.get("mobile.loading.translation"));
                var lang = globalUser.get("LANGUAGE");
                dico.set({currentLanguage : lang});
                var online = me.isOnline();

                Cache.getFile('dictionary.' + lang + '.json',
                    function(data){
                        console.log("got offline dictionary data for language", lang);
                        dico.set({currentLanguage : lang});
                        dico.set(JSON.parse(data));
                        if (online) dico.fetch();
                        $.mobile.hidePageLoadingMsg();
                        me.views.leads = new LeadListView();
                    },
                    function(err){
                        console.log("no offline dictionary data for language", lang);
                        if (online) {
                            dico.fetch({
                                success: function() {
                                    console.log("got online dictionary data for language", lang);
                                    $.mobile.hidePageLoadingMsg();
                                    me.views.leads = new LeadListView();
                                }
                            });
                        }
                        else {
                            $.mobile.hidePageLoadingMsg();
                            alert("Error: No internet connection!");
                        }
                    }
                );
            };

            Cache.initialize(function(useCache) {
                console.log("use cache?", useCache ? "YES" : "NO");
                var online = me.isOnline();

                // load dictionnary first ( no language selected )
                var lang = dico.get("currentLanguage");
                Cache.getFile("dictionary." + lang + ".json",
                    function(data) {
                        console.log("found offline dictionary");
                        dico.set(JSON.parse(data));
                        globalUser.on("login-success", me.listMode);
                        globalUser.on("login-failed", me.loginFailedMode);
                        
                        // Remember me
                        if (Config.rememberMe) {
                            Cache.getFile("user.json",
                                function(data){
                                    console.log("got offline user data");
                                    var userData = JSON.parse(data);
                                    console.log(data);
                                    globalUser.set(userData, {silent:true});
                                    if (globalUser.isAuthentified()) me.listMode();
                                    else me.loginMode();
                                    
                                },
                                function(err){
                                    console.log("no offline user data");
                                    if (globalUser.isAuthentified()) me.listMode();
                                    else me.loginMode();
                                });
                        } else {
                            if (globalUser.isAuthentified()) me.listMode();
                            else me.loginMode();
                            
                        }
                        if (online) dico.fetch();
                    },
                    function(err) {
                        console.log("no offline dictionary");
                        if (online) dico.fetch({
                            success : function () {
                                globalUser.on("login-success", me.listMode);
                                globalUser.on("login-failed", me.loginFailedMode);
                                if (globalUser.isAuthentified()) me.listMode();
                                else me.loginMode();
                            },
                            error : function () { alert("Unable to load translation"); }
                        });
                        else alert("No internet connection!");
                    }
                );
            });

        };

        App.prototype = {
            views: {},
            collections: {},
            dictionary: false,
            user: false,
            config: false
        };

        // _.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };
        _.mixin({
            label: function(key) {
                var lbl = dico.get(key);
                return (typeof(lbl) != "undefined" && lbl.length > 0) ? lbl : key;
            },
            formatDate: function(str, noYear) {
                var date = new Date(str);
                if (isNaN(date.getTime())) return "";
                var format = noYear ? "dd.mm" : "dd.mm.yyyy";
                return date.format(format);
            },
            getMinDate: function(list, prop) {
                var l = _.pluck(list, prop);
                return _.min(l, function(str) { return str === "" ? new Date() : new Date(str); });
            }
        });

        return App;
    }
);