'use strict';

const React = require('react');
const {bool, func, string} = React.PropTypes;
const dataService = require('../../../services/data-service');
const Notice = require('./notice');
const PilotModel = require('../../../models/pilot');


const EmailVerificationNotice = React.createClass({

  propTypes: {
    isPadded: bool,
    text: string,
    type: string,
    onClose: func
  },

  getDefaultProps: function () {
    return {
      text: [
        'We sent you an email with a verification link.',
        'Please follow it to activate your account.',
        'It is required for safety of your records',
        'since your email is the only way to access the application'
      ].join(' ')
    };
  },

  getInitialState: function () {
    return {
      isSending: false,
      isEmailSent: false
    };
  },

  handleEmailVerification: function () {
    this.setState({isSending: true});
    dataService.sendVerificationEmail().then(() => {
      this.setState({isEmailSent: true});
    });
  },

  render: function () {
    let noticeText = this.props.text;
    let type = this.props.type;
    let onClick = this.handleEmailVerification;

    if (this.state.isEmailSent) {
      noticeText = 'The verification link was sent to your email ' + PilotModel.getEmailAddress();
      type = 'success';
      onClick = null;
    }

    return (
      <Notice
        buttonText={this.state.isSending ? 'Sending...' : 'Send email again'}
        isButtonEnabled={!this.state.isSending}
        isPadded={this.props.isPadded}
        text={noticeText}
        type={type}
        onClick={onClick}
        onClose={this.props.onClose}
      />
    );
  }
});


module.exports = EmailVerificationNotice;
