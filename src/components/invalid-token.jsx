'use strict';

var React = require('react');
var History = require('react-router').History;
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var Notice = require('./common/notice/notice');


var InvalidToken = React.createClass({

    mixins: [ History ],

    handleToLogin: function() {
        this.history.pushState(null, '/login');
    },

    render: function() {
        return (
            <div>
                <TopMenu
                    headerText='Koifly'
                    rightText='Log in'
                    onRightClick={ this.handleToLogin }
                    />
                <Notice text='Link token is invalid or expired' type='error' />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = InvalidToken;
