'use strict';

var React = require('react');

var Notice = require('../common/notice/notice');


var noPage = React.createClass({

    render: function() {
        return (
            <Notice
                text='Oops! Page not found'
                type='error'
                />
        );
    }
});


module.exports = noPage;
