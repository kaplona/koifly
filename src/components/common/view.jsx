'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');

var ErrorTypes = require('../../errors/error-types');
var PilotModel = require('../../models/pilot');

var EmailVerificationNotice = require('./notice/email-verification-notice');
var Login = require('../public-views/login');


var View = React.createClass({

    propTypes: {
        onDataModified: React.PropTypes.func.isRequired,
        error: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            isActivationNotice: false
        };
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
        this.setState({ isActivationNotice: PilotModel.getActivationNoticeStatus() });
    },

    handleCloseNotice: function() {
        PilotModel.hideActivationNotice();
        this.setState({ isActivationNotice: false });
    },

    renderNotice: function() {
        if (this.state.isActivationNotice) {
            return <EmailVerificationNotice onClose={ this.handleCloseNotice } />;
        }
    },

    render: function() {
        if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_ERROR) {
            return <Login isStayOnThisPage={ true } />;
        }

        return (
            <div>
                { this.renderNotice() }
                { this.props.children }
            </div>
        );
    }
});

module.exports = View;
