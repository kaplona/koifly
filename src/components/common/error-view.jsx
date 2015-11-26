'use strict';

var React = require('react');
var ErrorNames = require('../../utils/error-names');
var RetrieveError = require('./retrieve-error');


var ErrorView = React.createClass({
    propTypes: {
        error: React.PropTypes.object,
        onTryAgain: React.PropTypes.func
    },

    render: function() {
        if (this.props.error.name === ErrorNames.RETRIEVING_FAILURE) {
            return <RetrieveError onTryAgain={ this.props.onTryAgain }/>;
        }

        if (this.props.error.name === ErrorNames.NO_EXISTENT_RECORD) {
            return <div>{ this.props.error.message }</div>;
        }

        return <div className='error_box error_message'>{ this.props.error.message }</div>;
    }
});

module.exports = ErrorView;
