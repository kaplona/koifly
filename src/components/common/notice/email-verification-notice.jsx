'use strict';

var React = require('react');
var dataService = require('../../../services/data-service');
var PilotModel = require('../../../models/pilot');
var Notice = require('./notice');


var EmailVerificationNotice = React.createClass({

    propTypes: {
        text: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        onClose: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            text: [
                'We sent you an email with a verification link.',
                'Please follow it to activate your account.',
                'It is required for safety of your records',
                'since your email is the only way to access the application'
            ].join(' ')
        };
    },

    getInitialState: function() {
        return {
            isSending: false,
            isEmailSent: false
        };
    },

    handleEmailVerification: function() {
        this.setState({ isSending: true });
        dataService.sendVerificationEmail().then(() => {
            this.setState({ isEmailSent: true });
        });
    },

    render: function() {
        var noticeText = this.props.text;
        var type = this.props.type;
        var onClick = this.handleEmailVerification;

        if (this.state.isEmailSent) {
            var email = PilotModel.getEmailAddress();
            noticeText = 'The verification link was sent to your email ' + email;
            type = 'success';
            onClick = null;
        }

        return (
            <Notice
                text={ noticeText }
                type={ type }
                onClick={ onClick }
                buttonText={ this.state.isSending ? 'Sending...' : 'Send email again' }
                isButtonEnabled={ !this.state.isSending }
                onClose={ this.props.onClose }
                />
        );
    }
});


module.exports = EmailVerificationNotice;
