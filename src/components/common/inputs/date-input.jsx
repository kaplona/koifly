import React from 'react';
import { element, func, oneOfType, string } from 'prop-types';
import Label from '../section/label';
import InputContainer from './input-container';
import ValidationError from '../section/validation-error';


export default class DateInput extends React.Component {
  handleUserInput(e, inputName) {
    let value = e.target.value;
    if (inputName === 'time' && value === '') {
      value = null;
      e.target.value = null;
    }
    this.props.onChange(inputName, value);
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
          <div className='col-of-two'>
            <input
              className={className}
              value={this.props.inputDateValue}
              type='date'
              onChange={e => this.handleUserInput(e, 'date')}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
            />
            &nbsp;&nbsp;
            <input
              className={className}
              value={this.props.inputTimeValue}
              type='time'
              onChange={e => this.handleUserInput(e, 'time')}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
            />
          </div>
        </InputContainer>
      </div>
    );
  }
}


DateInput.propTypes = {
  inputDateValue: string.isRequired,
  inputTimeValue: string,
  labelText: oneOfType([
    string,
    element
  ]),
  errorMessage: string,
  onChange: func.isRequired,
  onFocus: func,
  onBlur: func
};
