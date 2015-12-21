'use strict';

var React = require('react');


var InvalidToken = React.createClass({

    render: function() {
        return <div>Link token is invalid or expired</div>;
    }
});


module.exports = InvalidToken;
