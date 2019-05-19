'use strict';

const React = require('react');
const {element, func, oneOfType, string} = React.PropTypes;
const InputContainer = require('./input-container');
const Label = require('../section/label');
const ValidationError = require('../section/validation-error');


const PasswordInput = React.createClass({

  propTypes: {
    inputValue: string.isRequired,
    labelText: oneOfType([string, element]),
    inputName: string.isRequired,
    errorMessage: string,
    onChange: func.isRequired,
    onFocus: func,
    onBlur: func
  },

  handleUserInput: function () {
    this.props.onChange(this.props.inputName, this.refs.input.value);
  },

  renderErrorMessage: function () {
    if (this.props.errorMessage) {
      return <ValidationError message={this.props.errorMessage}/>;
    }
  },

  render: function () {
    let className = 'x-text';
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
            type='password'
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


module.exports = PasswordInput;
