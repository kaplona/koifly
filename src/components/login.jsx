'use strict';

var React = require('react');
var History = require('react-router').History;
// TODO merge loginForm and Login components (if no need for them to be separate)
var LoginForm = require('./common/login-form');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');


var Login = React.createClass({

    propTypes: {
        isStayOnThisPage: React.PropTypes.bool
    },

    mixins: [ History ],

    handleLogin: function() {
        if (!this.props.isStayOnThisPage) {
            this.history.pushState(null, '/flights');
        }
    },

    handleToAbout: function() {
        // TODO create About page
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
                    leftText='About'
                    rightText='Sign Up'
                    onLeftClick={ this.handleToAbout }
                    onRightClick={ this.handleToSignup }
                    />
                <LoginForm onLogin={ this.handleLogin } />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = Login;
