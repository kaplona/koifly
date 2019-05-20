'use strict';

const React = require('react');
const { bool, element, func, oneOfType, string } = React.PropTypes;
const Label = require('../section/label');
const InputContainer = require('./input-container');
const ValidationError = require('../section/validation-error');


const TextInput = React.createClass({

  propTypes: {
    inputValue: string.isRequired,
    labelText: oneOfType([string, element]),
    inputName: string.isRequired,
    isNumber: bool.isRequired,
    isEmail: bool.isRequired,
    errorMessage: string,
    onChange: func.isRequired,
    onFocus: func,
    onBlur: func
  },

  getDefaultProps: function() {
    return {
      isNumber: false,
      isEmail: false
    };
  },

  handleUserInput: function() {
    this.props.onChange(this.props.inputName, this.refs.input.value);
  },

  renderErrorMessage: function() {
    if (this.props.errorMessage) {
      return <ValidationError message={this.props.errorMessage}/>;
    }
  },

  render: function() {
    let className = this.props.isNumber ? 'x-number' : 'x-text';
    if (this.props.errorMessage) {
      className += ' x-error';
    }

    return (
      <div>
        {this.renderErrorMessage()}

        <Label>
          {this.props.labelText}
        </Label>

        <InputContainer>
          <input
            className={className}
            value={this.props.inputValue}
            type={this.props.isEmail ? 'email' : 'text'}
            pattern={this.props.isNumber ? '[0-9]*' : null}
            placeholder={this.props.isNumber ? '0' : ''}
            onChange={this.handleUserInput}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
            ref='input'
          />
        </InputContainer>
      </div>
    );
  }
});


module.exports = TextInput;
