'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
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
