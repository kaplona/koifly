'use strict';

var React = require('react');

var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');


var EmailVerified = React.createClass({

    render: function() {
        return (
            <div>
                <MobileTopMenu header='Koifly' />
                <NavigationMenu />
                
                <Notice text='Thank you, you are now logged in and can continue working with Koifly!' type='success' />
            </div>
        );
    }
});


module.exports = EmailVerified;
