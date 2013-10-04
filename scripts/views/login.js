define(['text!templates/login.html', 'collections/countries', 'cache', 'md5', 'config'],

    function(LoginTemplate, CountryCollection, Cache, MD5, Config){

        var LoginView = Backbone.View.extend({

            template: _.template(LoginTemplate),

            events:{
                "click .btn-login" : "checkLogin"
            },

            initialize: function() {
                this.collection = new CountryCollection();
                _.bindAll(this, "render", "renderCountries");
            },

            render: function() {
                console.log("render : LoginView");
                var online = App.isOnline();
                var self = this;

                Cache.getFile("countries.json",
                    function(data) {
                        console.log("got offline countries data");
                        self.collection.reset(JSON.parse(data));
                        self.renderCountries();
                        if (online) self.collection.fetch({reset:false});
                    },
                    function(err) {
                        console.log("no offline countries data");
                        if (online) self.collection.fetch({
                            reset:true,
                            success:function(){ self.renderCountries(); }
                        });
                    }
                );
                this.$el.html(this.template());
                return this;
            },

            renderCountries: function() {
                var tpl = $("script.countryOptions").html();
                $("#login-countrycode").append(_.template(tpl, {countries:this.collection.toJSON()}));
            },

            checkLogin: function() {
                $.mobile.showPageLoadingMsg(null, _.label("mobile.loading.auth"));
                var online  = App.isOnline();
                var pwd     = $('#login-password').val();
                var user    = $('#login-username').val();
                var country = $('#login-countrycode').val();
                var hash    = MD5.hash(user + "|" + pwd + "|" + country);
                if (online) {
                    console.log("Online authenticating...");
                    globalUser.set({
                        ws_qs:"&username="+user+"&password="+pwd+"&countrycode="+country,
                        cc:country
                    });
                    globalUser.fetch({success: function(model, response, options) {
                        if (globalUser.isAuthentified()) Cache.saveFile("credentials", hash);
                        $.mobile.hidePageLoadingMsg();

                    }, error: function(collection, response) {
                        $.mobile.hidePageLoadingMsg();
                    }});
                }
                else {
                    // Offline auth
                    console.log("Offline authenticating...");
                    Cache.getFile("credentials",
                        function(data){
                            $.mobile.hidePageLoadingMsg();
                            if (data === hash) {
                                console.log("Offline login successful");
                                Cache.getFile('user.json',
                                    function(data){
                                        console.log("Found offline user data");
                                        var json = JSON.parse(data);
                                        json.AUTHENTIFIED = true;
                                        globalUser.set(json);
                                        if (Config.rememberMe) Cache.saveFile("user.json", JSON.stringify(globalUser.toJSON()));
                                    },
                                    function(err){
                                        console.log("No offline user data");
                                        globalUser.set({AUTHENTIFIED:false});
                                    }
                                );
                            }
                            else {
                                console.log("Offline login failed");
                                globalUser.set({AUTHENTIFIED:false});
                            }
                        },
                        function(err){
                            $.mobile.hidePageLoadingMsg();
                            console.log("No offline credentials");
                        });
                }
            }
        });

        return LoginView;
    });