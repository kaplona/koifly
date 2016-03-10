'use strict';

var React = require('react');

require('./value-container.less');


var Value = React.createClass({
    render: function() {
        return (
            <div className='value-container'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Value;
