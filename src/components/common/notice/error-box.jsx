import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import errorTypes from '../../../errors/error-types';
import Notice from './notice';


// defined as class for testing purposes
export default class ErrorBox extends React.Component {
  render() {
    let onClick = this.props.onTryAgain;
    if (this.props.error.type === errorTypes.RECORD_NOT_FOUND ||
      this.props.error.type === errorTypes.VALIDATION_ERROR
    ) {
      onClick = null;
    }

    return (
      <Notice
        buttonText={this.props.isTrying ? 'Trying ...' : 'Try Again'}
        isPadded={this.props.isPadded}
        text={this.props.error.message}
        type='error'
        onClick={onClick}
      />
    );
  }
}


ErrorBox.defaultProps = {
  isTrying: false
};

ErrorBox.propTypes = {
  error: shape({
    type: string,
    message: string
  }).isRequired,
  isPadded: bool,
  isTrying: bool,
  onTryAgain: func
};
