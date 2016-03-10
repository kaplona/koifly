'use strict';

var React = require('react');

require('./description.less');


var Description = React.createClass({
    render: function() {
        return (
            <div className='description'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Description;
