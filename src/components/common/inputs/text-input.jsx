'use strict';

import React from 'react';
import { bool, element, func, oneOfType, string } from 'prop-types';
import Label from '../section/label';
import InputContainer from './input-container';
import ValidationError from '../section/validation-error';


export default class TextInput extends React.Component {
  constructor() {
    super();
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  render() {
    let className = this.props.isNumber ? 'x-number' : 'x-text';
    if (this.props.errorMessage) {
      className += ' x-error';
    }

    return (
      <div>
        {!!this.props.errorMessage && (
          <ValidationError message={this.props.errorMessage}/>
        )}

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
          />
        </InputContainer>
      </div>
    );
  }
}


TextInput.defaultProps = {
  isNumber: false,
  isEmail: false
};

TextInput.propTypes = {
  inputValue: string.isRequired,
  labelText: oneOfType([string, element]),
  inputName: string.isRequired,
  isNumber: bool.isRequired,
  isEmail: bool.isRequired,
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
