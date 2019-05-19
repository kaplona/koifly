'use strict';

const React = require('react');
const {func, string} = React.PropTypes;
const Label = require('../section/label');
const ValidationError = require('../section/validation-error');

require('./remarks.less');


const RemarksInput = React.createClass({

  propTypes: {
    inputValue: string.isRequired,
    labelText: string,
    inputName: string.isRequired,
    errorMessage: string,
    onChange: func.isRequired,
    onFocus: func,
    onBlur: func
  },

  getDefaultProps: function () {
    return {
      inputName: 'remarks'
    };
  },

  handleUserInput: function () {
    this.props.onChange(this.props.inputName, this.refs.textarea.value);
  },

  renderErrorMessage: function () {
    if (this.props.errorMessage) {
      return <ValidationError message={this.props.errorMessage}/>;
    }
  },

  render: function () {
    return (
      <div>
        {this.renderErrorMessage()}
        <Label>{this.props.labelText}</Label>
        <textarea
          className={this.props.errorMessage ? 'x-error' : null}
          value={this.props.inputValue}
          onChange={this.handleUserInput}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
          ref='textarea'
        />
      </div>
    );
  }
});


module.exports = RemarksInput;
