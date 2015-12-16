'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');
var LogInForm = require('./log-in-form');
var ErrorTypes = require('../../utils/error-types');


var View = React.createClass({
    propTypes: {
        onDataModified: React.PropTypes.func,
        error: React.PropTypes.object
    },

    componentDidMount: function() {
        PubSub.on('dataModified', this.handleDataModified, this);
        this.handleDataModified();
    },

    componentWillUnmount: function() {
        PubSub.removeListener('dataModified', this.handleDataModified, this);
    },

    handleDataModified: function() {
        this.props.onDataModified();
    },

    render: function() {
        if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_FAILURE) {
            return <LogInForm />;
        }

        return (
            <div>
                { this.props.children }
            </div>
        );
    }
});

module.exports = View;
