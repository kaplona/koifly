'use strict';

var React = require('react');
var ErrorTypes = require('../../utils/error-types');
var RetrieveError = require('./retrieve-error');


var ErrorView = React.createClass({
    propTypes: {
        error: React.PropTypes.shape({
            type: React.PropTypes.string,
            message: React.PropTypes.string
        }).isRequired,
        onTryAgain: React.PropTypes.func
    },

    render: function() {
        if (this.props.error.type === ErrorTypes.RETRIEVING_FAILURE &&
            this.props.onTryAgain
        ) {
            return <RetrieveError onTryAgain={ this.props.onTryAgain }/>;
        }

        return <div className='error_box error_message'>{ this.props.error.message }</div>;
    }
});

module.exports = ErrorView;
