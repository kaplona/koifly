'use strict';

import React from 'react';
import { element, func, oneOfType, string } from 'prop-types';
import Label from '../section/label';
import InputContainer from './input-container';
import ValidationError from '../section/validation-error';


export default class DateInput extends React.Component {
  constructor() {
    super();
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  render() {
    let className = 'x-date';
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
            type='date'
            onChange={this.handleUserInput}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
        </InputContainer>
      </div>
    );
  }
}


DateInput.propTypes = {
  inputValue: string.isRequired,
  labelText: oneOfType([
    string,
    element
  ]),
  inputName: string.isRequired,
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
