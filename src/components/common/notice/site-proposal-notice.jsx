import React from 'react';
import { func, string } from 'prop-types';
import Notice from './notice';

export default class SiteProposalNotice extends React.Component {
  render() {
    const noticeText = this.props.text;
    const buttonText = this.props.buttonText;
    const type = this.props.type;

    return (
      <Notice
        buttonText={buttonText}
        isButtonEnabled={true}
        text={noticeText}
        type={type}
        onClick={this.props.onClick}
        onClose={this.props.onClose}
      />
    );
  }
}

SiteProposalNotice.propTypes = {
  text: string,
  buttonText: string,
  type: string,
  onClose: func,
  onClick: func
};
