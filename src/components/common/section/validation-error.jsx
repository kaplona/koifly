'use strict';

var React = require('react');

require('./validation-error.less');


var ValidationError = React.createClass({

    propTypes: {
        text: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
            <div className='validation-error'>
                { this.props.text }
            </div>
        );
    }
});


module.exports = ValidationError;
