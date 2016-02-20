'use strict';

var React = require('react');
var DataService = require('../../../services/data-service');
var PilotModel = require('../../../models/pilot');
var Notice = require('./notice');


var EmailVerificationNotice = React.createClass({

    propTypes: {
        onClose: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            isEmailSent: false
        };
    },

    handleEmailVerification: function() {
        DataService.sendVerificationEmail().then(() => {
            this.setState({ isEmailSent: true });
        });
    },

    render: function() {
        var noticeText = [
            'We sent you email with verification link.',
            'Please follow it to activate your account.',
            'It is required for your records safety',
            'since your email is the primary way to access application'
        ].join(' ');
        var onClick = this.handleEmailVerification;
        var onClose = this.props.onClose;
        if (this.state.isEmailSent) {
            var email = PilotModel.getEmailAddress();
            noticeText = 'The verification link is sent to your email ' + email;
            onClick = null;
            onClose = null;
        }

        return (
            <Notice
                text={ noticeText }
                onClick={ onClick }
                buttonText='Send email again'
                onClose={ onClose }
                />
        );
    }
});


module.exports = EmailVerificationNotice;
