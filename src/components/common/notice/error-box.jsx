'use strict';

var React = require('react');
var ErrorTypes = require('../../../errors/error-types');
var Notice = require('./notice');


var ErrorBox = React.createClass({
    propTypes: {
        error: React.PropTypes.shape({
            type: React.PropTypes.string,
            message: React.PropTypes.string
        }).isRequired,
        onTryAgain: React.PropTypes.func,
        isTrying: React.PropTypes.bool
    },

    render: function() {
        var onClick = this.props.onTryAgain;
        if (this.props.error.type === ErrorTypes.RECORD_NOT_FOUND ||
            this.props.error.type === ErrorTypes.VALIDATION_ERROR
        ) {
            onClick = null;
        }

        return (
            <Notice
                text={ this.props.error.message }
                type='error'
                onClick={ onClick }
                buttonText={ this.props.isTrying ? 'Trying ...' : 'Try Again' }
                />
        );
    }
});

module.exports = ErrorBox;
