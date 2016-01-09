'use strict';

var React = require('react');


var Label = React.createClass({
    render: function() {
        return (
            <div className='label'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = Label;
