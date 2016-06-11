'use strict';

var React = require('react');

var MobileTopMenu = require('../common/menu/mobile-top-menu');
var NavigationMenu = require('../common/menu/navigation-menu');
var Notice = require('../common/notice/notice');


var noPage = React.createClass({

    render: function() {
        return (
            <div>
                <MobileTopMenu header='Koifly' />
                <NavigationMenu isMobile={ true } />
                <Notice
                    text='Oops! Page not found'
                    type='error'
                    />
            </div>
        );
    }
});


module.exports = noPage;
