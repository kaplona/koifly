'use strict';

var React = require('react');
var History = require('react-router').History;

var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');


var InvalidVerificationLink = React.createClass({

    mixins: [ History ],

    handleToLogin: function() {
        this.history.pushState(null, '/login');
    },

    render: function() {
        return (
            <div>
                <MobileTopMenu
                    header='Koifly'
                    rightButtonCaption='Log in'
                    onRightClick={ this.handleToLogin }
                    />
                <NavigationMenu />
                
                <Notice text='Verification link is invalid or expired' type='error' />
            </div>
        );
    }
});


module.exports = InvalidVerificationLink;
