'use strict';

var React = require('react');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var Notice = require('./common/notice/notice');


var EmailVerified = React.createClass({

    render: function() {
        return (
            <div>
                <TopMenu headerText='Koifly' />
                <Notice text='Thank you, your email was successfully verified' type='success' />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = EmailVerified;
