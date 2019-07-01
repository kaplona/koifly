import React from 'react';
import { element, func, oneOfType, string } from 'prop-types';
import InputContainer from './input-container';
import Label from '../section/label';
import ValidationError from '../section/validation-error';


export default class PasswordInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(e) {
    this.props.onChange(this.props.inputName, e.target.value);
  }

  render() {
    let className = 'x-text';
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
            type='password'
            onChange={this.handleUserInput}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
        </InputContainer>
      </div>
    );
  }
}


PasswordInput.propTypes = {
  inputValue: string.isRequired,
  labelText: oneOfType([string, element]),
  inputName: string.isRequired,
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
