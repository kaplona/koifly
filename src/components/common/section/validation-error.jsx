'use strict';

var React = require('react');

require('./validation-error.less');


var ValidationError = React.createClass({

    propTypes: {
        message: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
            <div className='validation-error'>
                { this.props.message }
            </div>
        );
    }
});


module.exports = ValidationError;
