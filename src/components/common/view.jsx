'use strict';

var React = require('react');
var PubSub = require('../../utils/pubsub');
var DataService = require('../../services/data-service');
var PilotModel = require('../../models/pilot');
var LoginForm = require('./login-form');
var Notice = require('./notice');
var ErrorTypes = require('../../utils/error-types');


var View = React.createClass({
    propTypes: {
        onDataModified: React.PropTypes.func,
        error: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            isUserActivated: PilotModel.getActivationStatus(),
            isEmailSent: false
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
        this.setState({ isUserActivated: PilotModel.getActivationStatus() });
        if (this.props.onDataModified) {
            this.props.onDataModified();
        }
    },

    handleEmailVerification: function() {
        DataService.sendVerificationEmail().then(() => {
            this.setState({ isEmailSent: true });
        });
    },

    renderNotice: function() {
        if (this.state.isUserActivated === false) {
            var noticeText = 'Your account was not activated. You cannot save any data until you verify your email';
            var onClick = this.handleEmailVerification;
            if (this.state.isEmailSent) {
                noticeText = 'The verification link is sent to your email';
                onClick = null;
            }

            return (
                <Notice
                    text={ noticeText }
                    onClick={ onClick }
                    buttonText='Send email again'
                    />
            );
        }
    },

    render: function() {
        if (this.props.error && this.props.error.type === ErrorTypes.AUTHENTICATION_FAILURE) {
            return <LoginForm />;
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
