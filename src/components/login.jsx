'use strict';

var React = require('react');
var History = require('react-router').History;
var LoginForm = require('./common/login-form');


var Login = React.createClass({

    mixins: [ History ],

    handleLogin: function() {
        this.history.pushState(null, '/');
    },

    render: function() {
        return <LoginForm onLogin={ this.handleLogin } />;
    }
});


module.exports = Login;
