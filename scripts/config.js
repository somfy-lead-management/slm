define(['underscore', 'dateformat'], function(_) {
    return {

        baseURL:"http://mobile.ppr-somfy.msp.fr.clara.net/leadmanagement/MobileService.cfc",
        //baseURL:"http://service.somfy.com/leadmanagement/MobileService.cfc",

        pushAlerts:{alert:true, badge:true, sound:true},
        rememberMe:true
    };
});