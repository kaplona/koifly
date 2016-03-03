'use strict';

var React = require('react');
var ErrorTypes = require('../../../utils/error-types');
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
        if (this.props.error.type === ErrorTypes.NO_EXISTENT_RECORD ||
            this.props.error.type === ErrorTypes.VALIDATION_FAILURE
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
