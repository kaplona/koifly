'use strict';

var React = require('react');

require('./loader.less');


var Loader = React.createClass({
    propTypes: {
        mini: React.PropTypes.bool
    },

    render: function() {
        return <div className='loader' />;
    }
});

module.exports = Loader;
