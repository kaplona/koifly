'use strict';

var React = require('react');

var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');
var PublicLinksMixin = require('../mixins/public-links-mixin');


var InvalidVerificationLink = React.createClass({

    mixins: [ PublicLinksMixin ],

    render: function() {
        return (
            <div>
                <MobileTopMenu
                    header='Koifly'
                    rightButtonCaption='Log in'
                    onRightClick={ this.handleGoToLogin }
                    />
                <NavigationMenu isMobile={ true } />
                
                <Notice text='Verification link is invalid or expired' type='error' />
            </div>
        );
    }
});


module.exports = InvalidVerificationLink;
