'use strict';

var History = require('react-router').History;


var PublicLinksMixin = {

    mixins: [ History ],

    handleGoToFlightLog: function() {
        this.history.pushState(null, '/flights');
    },

    handleGoToHomePage: function() {
        // need to request marketing page from the server
        window.location.href = '/';
    },

    handleGoToLogin: function() {
        this.history.pushState(null, '/login');
    },

    handleGoToOneTimeLogin: function() {
        this.history.pushState(null, '/one-time-login');
    },

    handleGoToPilotView: function() {
        this.history.pushState(null, '/pilot');
    },

    handleGoToResetPassword: function() {
        this.history.pushState(null, '/reset-password');
    },

    handleGoToSignup: function() {
        this.history.pushState(null, '/signup');
    }
};


module.exports = PublicLinksMixin;
