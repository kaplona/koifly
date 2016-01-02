'use strict';

var React = require('react');
var DataService = require('../../services/data-service');
var PilotModel = require('../../models/pilot');
var Notice = require('./notice');


var EmailVerificationNotice = React.createClass({

    propTypes: {
        text: React.PropTypes.string.isRequired,
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
        var noticeText = this.props.text;
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
