'use strict';

var React = require('react');
var Notice = require('./common/notice/notice');


var EmailVerified = React.createClass({

    render: function() {
        return <Notice text='Thank you, your email was successfully verified' type='success' />;
    }
});


module.exports = EmailVerified;
