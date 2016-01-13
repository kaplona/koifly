'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');
var PilotModel = require('../../models/pilot');
var Login = require('../login');
var EmailVerificationNotice = require('./notice/email-verification-notice');
var ErrorTypes = require('../../utils/error-types');


var View = React.createClass({

    propTypes: {
        onDataModified: React.PropTypes.func,
        error: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            isActivationNotice: PilotModel.getActivationNoticeStatus()
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
        if (this.props.onDataModified) {
            this.props.onDataModified();
        }
        this.setState({ isActivationNotice: PilotModel.getActivationNoticeStatus() });
    },

    handleCloseNotice: function() {
        PilotModel.hideActivationNotice();
        this.setState({ isActivationNotice: false });
    },

    renderNotice: function() {
        if (this.state.isActivationNotice) {
            var noticeText = [
                'Your email has not been verified yet.',
                'It is required for your records safety',
                'since your email is the primary way to access the App'
            ].join(' ');

            return (
                <EmailVerificationNotice
                    text={ noticeText }
                    onClose={ this.handleCloseNotice }
                    />
            );
        }
    },

    render: function() {
        if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_FAILURE) {
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
