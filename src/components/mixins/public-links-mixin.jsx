'use strict';

var browserHistory = require('react-router').browserHistory;


var PublicLinksMixin = {

    handleGoToFlightLog: function() {
        browserHistory.push('/flights');
    },

    handleGoToHomePage: function() {
        // need to request marketing page from the server
        window.location.href = '/';
    },

    handleGoToLogin: function() {
        browserHistory.push('/login');
    },

    handleGoToOneTimeLogin: function() {
        browserHistory.push('/one-time-login');
    },

    handleGoToPilotView: function() {
        browserHistory.push('/pilot');
    },

    handleGoToResetPassword: function() {
        browserHistory.push('/reset-password');
    },

    handleGoToSignup: function() {
        browserHistory.push('/signup');
    }
};


module.exports = PublicLinksMixin;
