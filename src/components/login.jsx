'use strict';

var React = require('react');
var History = require('react-router').History;
var LoginForm = require('./common/login-form');
var TopMenu = require('./common/top-menu');
var BottomMenu = require('./common/bottom-menu');


var Login = React.createClass({

    mixins: [ History ],

    handleLogin: function() {
        this.history.pushState(null, '/');
    },

    handleToSignup: function() {
        this.history.pushState(null, '/signup');
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    rightText='Sign Up'
                    onRightClick={ this.handleToSignup }
                    />
                <LoginForm onLogin={ this.handleLogin } />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = Login;
