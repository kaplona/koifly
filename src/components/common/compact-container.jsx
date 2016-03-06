'use strict';


var React = require('react');

require('./compact-container.less');


var CompactContainer = React.createClass({
    render: function() {
        return <div className='compact-container'>{ this.props.children }</div>;
    }
});


module.exports = CompactContainer;
