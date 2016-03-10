'use strict';

var React = require('react');

require('./loader.less');


var Loader = React.createClass({
    render: function() {
        return <div className='loader' />;
    }
});

module.exports = Loader;
