requirejs.config({

    baseUrl:"scripts",
    paths: {

        // Require.js plugins
        text:       'libs/require/text',     // Text plugin
        domReady:   'libs/require/domReady', // DomReady plugin

        // Libraries
        underscore: 'libs/underscore',
        backbone:   'libs/backbone',
        jquery:     'libs/jquery',
        jqm:        'libs/jquery-mobile',
        navigator:  'libs/jqmNavigator',
        md5:        'libs/spark-md5',
        dateformat: 'libs/dateformat'
    },

    shim:{
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        jqm: {
            deps: ['jquery']
        },
        main: {
            deps: ['backbone', 'jqm']
        }
    }
});

require(['domReady', 'main', 'config'],

    function(domReady, App, Config) {

        domReady(function () {

            function start(deviceToken) {
                deviceToken = deviceToken || false;
                console.log("Starting app...");
                window.App = new App(deviceToken);
            }

            function onDeviceReady(desktop) {                
                $.mobile.defaultPageTransition = 'slide';
                if (desktop !== true) {
                    console.log("onDeviceIsReady()", "Starting in mobile mode");
                    cordova.exec(null, null, 'SplashScreen', 'hide', []);
                    var pn = window.plugins.pushNotification;
                    if (pn) pn.registerDevice(Config.pushAlerts, function(status){ start(status.deviceToken); }, function(){ console.log("ERROR: Can't register for push"); });
                    else start();
                }
                else {
                    console.log("onDeviceIsReady()", "Starting in desktop mode");
                    window.plugins = {};
                    start();
                }
            }

            var isDevice = navigator.userAgent.match(/(iPad|iPhone|Android)/);
            if (isDevice) document.addEventListener('deviceready', onDeviceReady, false);
            else onDeviceReady(true);
        });
    }
);