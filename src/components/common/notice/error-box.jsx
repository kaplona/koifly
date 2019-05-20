'use strict';

const React = require('react');
const { bool, func, shape, string } = React.PropTypes;
const ErrorTypes = require('../../../errors/error-types');
const Notice = require('./notice');


const ErrorBox = React.createClass({
  propTypes: {
    error: shape({
      type: string,
      message: string
    }).isRequired,
    isPadded: bool,
    isTrying: bool,
    onTryAgain: func
  },

  getDefaultProps: function() {
    return {
      isTrying: false
    };
  },

  render: function() {
    let onClick = this.props.onTryAgain;
    if (this.props.error.type === ErrorTypes.RECORD_NOT_FOUND ||
      this.props.error.type === ErrorTypes.VALIDATION_ERROR
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
});

module.exports = ErrorBox;
