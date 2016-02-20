'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./separator.less');
}


var Separator = React.createClass({
    render: function() {
        return <div className='separator' />;
    }
});


module.exports = Separator;
