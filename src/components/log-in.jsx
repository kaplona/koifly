'use strict';

var React = require('react');
var History = require('react-router').History;
var LogInForm = require('./common/log-in-form');


var LogIn = React.createClass({

    mixins: [ History ],

    handleLogIn: function() {
        this.history.pushState(null, '/');
    },

    render: function() {
        return <LogInForm onLogIn={ this.handleLogIn } />;
    }
});


module.exports = LogIn;
