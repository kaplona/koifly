'use strict';

var React = require('react');
var Notice = require('./common/notice/notice');


var InvalidToken = React.createClass({

    render: function() {
        return <Notice text='Link token is invalid or expired' type='error' />;
    }
});


module.exports = InvalidToken;
