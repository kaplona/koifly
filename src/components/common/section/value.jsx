'use strict';

var React = require('react');

require('./value.less');


var Value = React.createClass({
    render: function() {
        return (
            <div className='value'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Value;
