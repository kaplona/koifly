'use strict';

import React from 'react';
import { bool, func, string } from 'prop-types';
import dataService from '../../../services/data-service';
import Notice from './notice';
import PilotModel from '../../../models/pilot';


export default class EmailVerificationNotice extends React.Component {
  constructor() {
    super();
    this.state = {
      isSending: false,
      isEmailSent: false
    };

    this.handleEmailVerification = this.handleEmailVerification.bind(this);
  }

  handleEmailVerification() {
    this.setState({ isSending: true });
    dataService.sendVerificationEmail().then(() => {
      this.setState({ isEmailSent: true });
    });
  }

  render() {
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
}


EmailVerificationNotice.defaultProps = {
  text: [
    'We sent you an email with a verification link.',
    'Please follow it to activate your account.',
    'It is required for safety of your records',
    'since your email is the only way to access the application'
  ].join(' ')
};

EmailVerificationNotice.propTypes = {
  isPadded: bool,
  text: string,
  type: string,
  onClose: func
};
