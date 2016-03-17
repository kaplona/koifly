'use strict';

var History = require('react-router').History;


var PublicLinksMixin = {

    mixins: [ History ],

    handleToFlightLog: function() {
        this.history.pushState(null, '/flights');
    },

    handleToHomePage: function() {
        this.history.pushState(null, '/');
    },

    handleToLogin: function() {
        this.history.pushState(null, '/login');
    },

    handleToOneTimeLogin: function() {
        this.history.pushState(null, '/one-time-login');
    },

    handleToPilotView: function() {
        this.history.pushState(null, '/pilot');
    },

    handleToResetPassword: function() {
        this.history.pushState(null, '/reset-password');
    },

    handleToSignup: function() {
        this.history.pushState(null, '/signup');
    }
};


module.exports = PublicLinksMixin;
